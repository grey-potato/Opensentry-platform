from __future__ import annotations

import shutil
import subprocess
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = 3000


def fail(message: str, code: int = 1) -> None:
    print(f"[run.py] {message}", file=sys.stderr)
    raise SystemExit(code)


def ensure_project_root() -> None:
    if not (ROOT / "package.json").exists():
        fail("package.json was not found next to run.py.")


def ensure_npm() -> str:
    npm = shutil.which("npm.cmd") or shutil.which("npm")
    if not npm:
        fail("npm.cmd was not found in PATH.")
    return npm


def powershell(command: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["powershell", "-NoProfile", "-Command", command],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )


def find_pid_on_port(port: int) -> int | None:
    result = powershell(
        f"$c = Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | "
        "Select-Object -First 1 -ExpandProperty OwningProcess; if ($c) { $c }"
    )
    output = result.stdout.strip()
    return int(output) if output.isdigit() else None


def read_process_commandline(pid: int) -> str:
    result = powershell(
        f"$p = Get-CimInstance Win32_Process -Filter \"ProcessId = {pid}\"; "
        "if ($p) { $p.CommandLine }"
    )
    return result.stdout.strip()


def stop_existing_dev_server() -> None:
    pid = find_pid_on_port(PORT)
    if not pid:
        return

    commandline = read_process_commandline(pid).lower()
    repo_token = str(ROOT).lower()
    if "next" not in commandline or repo_token not in commandline:
        fail(
            f"Port {PORT} is occupied by PID {pid}, but it does not look like this repo's Next dev server."
        )

    print(f"[run.py] Stopping existing dev server on port {PORT} (PID {pid})...")
    result = subprocess.run(
        ["taskkill", "/PID", str(pid), "/F"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if result.returncode != 0:
        fail(f"Failed to stop PID {pid}: {result.stderr.strip() or result.stdout.strip()}")

    for _ in range(20):
        if not find_pid_on_port(PORT):
            return
        time.sleep(0.25)

    fail(f"Port {PORT} is still occupied after attempting to stop PID {pid}.")


def stream_dev_server(npm: str) -> int:
    process = subprocess.Popen(
        [npm, "run", "dev", "--", "--hostname", HOST],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=1,
    )

    ready = False

    def terminate_child() -> None:
        if process.poll() is None:
            process.terminate()

    try:
        assert process.stdout is not None
        for line in process.stdout:
            print(line, end="")
            if not ready and "Ready" in line:
                ready = True
                print(f"[run.py] Development server ready at http://{HOST}:{PORT}")
    except KeyboardInterrupt:
        print("\n[run.py] Stopping development server...")
        terminate_child()
    finally:
        try:
            return process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
            return process.wait()


def main() -> None:
    ensure_project_root()
    npm = ensure_npm()
    stop_existing_dev_server()
    print(f"[run.py] Starting Next dev server at http://{HOST}:{PORT} ...")
    exit_code = stream_dev_server(npm)
    if exit_code != 0:
        fail(f"Next dev server exited with code {exit_code}.", exit_code)


if __name__ == "__main__":
    main()
