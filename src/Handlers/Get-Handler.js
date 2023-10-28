const fs = require('fs');

module.exports = (app) => {

    const directoriesInDirectory = fs.readdirSync('./Events/GetEvents', { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

    directoriesInDirectory.forEach(dir => {
        const event_files = fs.readdirSync(`./Events/GetEvents/${dir}`).filter(file => file.endsWith('.js'));

        for (file of event_files){
            var router = require(`../Events/GetEvents/${dir}/${file}`);
            app.use(`/Events/GetEvents/${dir}/${file.slice(0, -3)}`, router);
            console.log(`/Events/GetEvents/${dir}/${file.slice(0, -3)}`);
        }
    });
}