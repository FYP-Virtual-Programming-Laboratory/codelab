import time
import uuid

import docker  # type: ignore

from src.core.config import settings

user_id = uuid.uuid4()
user_locale = f"{settings.SUBMISSION_DIR}/session/{user_id}"
container_mount = f"/{user_id}"

client = docker.from_env()

# Pull and run the container
image = client.images.pull("node:23.9-alpine")
container = client.containers.run(
    image=image,
    command="sleep infinite",
    volumes={user_locale: {"bind": container_mount, "mode": "rw"}},
    detach=True,
    name=f"test_mounting_container_on_volume-{user_id}",
)

# Wait for container to be running
while container.status != "running":
    print(f"Waiting for container to run. Status is {container.status}")
    time.sleep(0.5)
    container.reload()

# Write the script to local directory
script_content = """
var inputMessage = "";
process.stdin.on("data", data => {
    inputMessage = data.toString();
    console.log('Received messae: ' + inputMessage);
});
"""

with open(f"{user_locale}/app.js", "w") as f:
    f.write(script_content)

# install bash into container
exit_code, output = container.exec_run(
    cmd="apk add bash",
    workdir=container_mount,
    demux=True,
    tty=False,  # set to True if your application requires a tty
)

exit_code, output = container.exec_run(
    cmd="""bash -c 'node app.js <<< "Hello world"' """,
    workdir=container_mount,
    demux=True,
    tty=False,  # set to True if your application requires a tty
)

# Run the script inside the container, passing the user's input
# exit_code, output = container.exec_run(
#     cmd=['python', 'script.py'],
#     workdir=container_mount,
#     stdin=True,
#     stdin_open=True,
#     demux=True,
# )

print(f"Exit Code: {exit_code}")
print(str(output))
