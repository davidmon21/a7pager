const fs = require('fs');
const { type } = require('os');
var template_path = "../mouse.template/"
function navbar_builder(navbar, links){
    var navbar = JSON.parse(fs.readFileSync(navbar))
    var navstring = navbar.opening
    for(let i in links){
        if(typeof(links[i][1]) == "string"){
            navstring+=navbar.item.replace("{{link}}", '"'+links[i][0]+'"').replace("{{title}}", links[i][1])
        }else{
            navstring+=navbar.dropdown.parent.replace("{{title}}",links[i][0])
            for(let n in links[i][1]){
                navstring+=navbar.dropdown.child.replace("{{link}}", '"'+links[i][1][n][0]+'"').replace("{{title}}", links[i][1][n][1])
            }
        }
    }
    navstring+=navbar.closing
    return navstring
}

function template_processor(template,variables,template_config,site_config){
    var text = ""
    for(let i in variables){
        if(variables[i] == "navbar"){
            var navstring = navbar_builder(template_path+template_config.variables_files.navbar, site_config.navbar)
            template = template.replace("{{navbar}}", navstring)
        }else if(site_config.hasOwnProperty(variables[i])){
            if(template_config.hasOwnProperty("variables_files")){
                if (template_config.variables_files.hasOwnProperty(variables[i])){
                    template = template.replace(`{{${variables[i]}}}`, template_processor(fs.readFileSync(template_path+template_config.variables_files[variables[i]]).toString(),template_config[variables[i]].variables,template_config[variables[i]],site_config[variables[i]]))
                }
            }
            template = template.replace(`{{${variables[i]}}}`, site_config[variables[i]])
        }else if(template_config.hasOwnProperty("defaults")){
            template = template.replace(`{{${variables[i]}}}`, template_config.defaults[variables[i]])
        }else{
            template = template.replace(`{{${variables[i]}}}`, "")
        }
    }
    return template
}

var template_config = JSON.parse(fs.readFileSync('../mouse.template/config.json'))
var navbar = JSON.parse(fs.readFileSync("../mouse.template/navbar.skel.json"))
var site_config = JSON.parse(fs.readFileSync('./config.json'))
var pages = fs.readdirSync("./pages")
//console.log(config.links)

var template = template_processor(fs.readFileSync('../mouse.template/main.skel.html').toString(), template_config.special_variables,template_config,site_config)

var template_copy = undefined
fs.mkdirSync("./compiled");
for( let i in pages){
    template_copy = template
    config_json = JSON.parse(fs.readFileSync("./pages/"+pages[i]))
    template_copy = template_processor(template_copy, template_config.variables,template_config,config_json)
    fs.writeFileSync("./compiled/"+config_json.file_name,template_copy)
}

// var articles_json=site_config.articles

// for(let i in articles_json.content){
//     template_processor(template_path+articles_json, template_config.variables,template_config,config_json)
// }
