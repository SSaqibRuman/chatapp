var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var sql = require('mssql/msnodesqlv8');
var config = {
    connectionString: 'Driver=SQL Server;Server=DESKTOP-54P3ROR\\SQLEXPRESS;Database=master;Trusted_Connection=true;'
};

const query = "SELECT * FROM users";

function printStatus() {
    sql.connect(config, err => {
        new sql.Request().query(query, (err, result) => {
            if (err) {
                console.log("Error: " + err);
            } else {
                for (let index = 0; index < result.recordset.length; index++) {
                    console.log(result.recordset[index]);
                }
            };
        });
    });
}

function setUserActive(userId, status) {
    sql.connect(config, err => {
        new sql.Request()
            .input('isActive', sql.Bit, status ? 1 : 0)
            .input('userId', sql.Int, userId)
            .query("UPDATE [users] SET [isActive] = @isActive WHERE [user_id] = @userId");
    });
}

function createChatRoom(chat_room_name, avatar_url, isGroup, isActive, user_id) {
    sql.connect(config, err => {
        new sql.Request()
            .input('id', sql.Int, user_id)
            .input('chat_room_name', sql.NVarChar, chat_room_name)
            .input('avatar_url', sql.NVarChar, avatar_url)
            .input('isGroup', sql.Bit, isGroup ? 1 : 0)
            .input('isActive', sql.Bit, isActive ? 1 : 0)
            .query('INSERT INTO [chat_room] ([chat_room_name], [avatar_url], [isGroup], [isActive], [created], [modified], [creator_id]) VALUES (@chat_room_name, @avatar_url, @isGroup, @isActive, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, @id)');
    });
}

function sendMessage(message, chatRoom_id, sender_id) {
    sql.connect(config, err => {
        new sql.Request()
            .input('chatRoom_id', sql.Int, chatRoom_id)
            .input('sender_id', sql.Int, sender_id)
            .input('message', sql.NVarChar, message)
            .query('INSERT INTO [chats] ([message], [chatRoom_id], [created], [sender_id]) VALUES (@message, @chatRoom_id, CURRENT_TIMESTAMP, @sender_id)');
    });
}

function createNewUser(user_id, name, avatar_url) {
    sql.connect(config, err => {
        new sql.Request()
            .input('id', sql.Int, user_id)
            .input('name', sql.NVarChar, name)
            .input('avatar_url', sql.NVarChar, avatar_url)
            .query('INSERT INTO [users] ([user_id], [name], [avatar_url], [created], [isActive]) VALUES (@id, @name, @avatar_url, CURRENT_TIMESTAMP, 0)');
    });
}

function getAllChats(user_id) {
    sql.connect(config, err => {
        new sql.Request()
            .input('userID', sql.Int, user_id)
            .query('SELECT [participant_id], [participants].[user_id], [participants].[chatRoom_id], participants.[created], [description], users.name, chat_room.isGroup, chat_room.chat_room_name from participants INNER JOIN users on users.user_id = participants.user_id INNER JOIN chat_room on chat_room.chat_room_id = participants.chatRoom_id WHERE users.user_id = @userID'
                , (err, result) => {
                    if (err) {
                        console.log("Error: " + err);
                    } else {
                        for (let index = 0; index < result.recordset.length; index++) {
                            console.log(result.recordset[index]);
                        }
                    };
                });
    });
}

function getMessages(chatRoom_id){

}


sql.on('error', err => { // Connection borked.
    console.log(".:The Bad Place:.");
    console.log("  Fork: " + err);
});



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

http.listen(port, () => {
    //setUserActive(1, false);
    //createNewUser(4,'Kevin','https://randomuser.me/api/portraits/men/60.jpg')
    //createChatRoom('Kevin_Tom','',false,false,4)
    //sendMessage('{"text": "Hello Dude"}', 1, 1)
    //printStatus();
    console.log('listening on *:3000');
    //getAllChats(1);
});