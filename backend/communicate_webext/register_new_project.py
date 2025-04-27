import json

def register_project(project_url):
    with open("extraction_projects.json",'r') as project_file:
        json_data= json.load(project_file)
        json_data[project_url]= {}
    with open("extraction_projects.json", 'w') as project_file:
        json.dump(json_data,project_file, indent=4)

