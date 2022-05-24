async function setupDb(client) {
    // id SERIAL PRIMARY KEY
    await client.query("CREATE TABLE IF NOT EXISTS reminders (id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, preset_name VARCHAR(255), data JSON NOT NULL);");
    /*CREATE TABLE reminders (
        id INT,
        message VARCHAR(255) NOT NULL,
        isActive BOOLEAN NOT NULL,
        hourToSend INT NOT NULL,
        minuteToSend INT NOT NULL,
        dayToSend VARCHAR(255),
        PRIMARY KEY (id)
    );*/
    const r = await client.query("SELECT COUNT(data) FROM reminders;");
    if (r.rows[0].count == 0) {
        console.log("Adding default reminder...");
        await addDefaultRow(client);
    }
}

async function addDefaultRow(client) {
    await client.query('INSERT INTO reminders (data) VALUES (\'{\
"message": "Reminder! To change this, say \\"Hey RBot, set reminder to X\\"","active": "false","hourToSend":6,"minuteToSend":30,"daysToSend":"mtwrf"\
}\')');
}

module.exports = { setupDb, addDefaultRow };