const fs = require('fs');

module.exports = (app) => {

    const directoriesInDirectory = fs.readdirSync('./Events/PostEvents', { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

    directoriesInDirectory.forEach(dir => {
        const event_files = fs.readdirSync(`./Events/PostEvents/${dir}`).filter(file => file.endsWith('.js'));

        for (file of event_files){
            var router = require(`../Events/PostEvents/${dir}/${file}`);
            app.use(`/Events/PostEvents/${dir}/${file.slice(0, -3)}`, router);
            console.log(`/Events/PostEvents/${dir}/${file.slice(0, -3)}`);
        }
    })
}