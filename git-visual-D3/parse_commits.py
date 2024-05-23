import json
import subprocess

def get_branch_name(commit_hash):
    branch_info = subprocess.check_output(f'git branch --contains {commit_hash}', shell=True).decode('utf-8').strip()
    branches = [line.strip() for line in branch_info.split('\n') if line.startswith('*') or line]
    return branches[0][2:] if branches else 'unknown'

subprocess.run('git log --pretty=format:"{%n  \\"commit\\": \\"%H\\",%n  \\"author\\": \\"%an\\",%n  \\"date\\": \\"%ad\\",%n  \\"message\\": \\"%s\\"%n}," > commits.json', shell=True)

with open('commits.json', 'r') as f:
    data = f.read()

data = f"[{data[:-1]}]"
commits = json.loads(data)

nodes = [{"id": commit["commit"], "group": 1, "message": commit["message"], "author": commit["author"], "date": commit["date"], "branch": get_branch_name(commit["commit"])} for commit in commits]
links = []

for commit in commits:
    parent_hashes = subprocess.check_output(f'git log --pretty=%P -n 1 {commit["commit"]}', shell=True).decode('utf-8').strip()
    for parent in parent_hashes.split():
        if parent:
            links.append({"source": parent, "target": commit["commit"]})

d3_data = {
    "nodes": nodes,
    "links": links
}

with open('d3_data.json', 'w') as f:
    json.dump(d3_data, f, indent=2)
