import json

def send_actions():
    with open("extraction_projects.json",'r') as project_file:
        project_data= json.load(project_file)
    project1= project_data["project1"]
    return project1

