import os
import shutil
import subprocess

subprocess.run(["npx", "create-next-app@latest", "frontend", "--typescript", "--eslint", "--tailwind", "--app", "--src-dir", "--import-alias=@/*", "--use-npm", "--yes"], check=True, shell=True)

src = "frontend"
for item in os.listdir(src):
    s = os.path.join(src, item)
    d = os.path.join(".", item)
    if os.path.exists(d):
        if os.path.isdir(d):
            shutil.rmtree(d)
        else:
            os.remove(d)
    shutil.move(s, d)

shutil.rmtree(src)
