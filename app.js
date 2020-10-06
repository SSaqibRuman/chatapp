var fs = require('fs');
var path = require('path');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3001;

var sql = require('mssql/msnodesqlv8');


var config = {
    //connectionString: 'Driver=SQL Server;Server=DESKTOP-54P3ROR\\SQLEXPRESS;Database=master;Trusted_Connection=true;',
    user: 'DB_A686D5_SyedXploria_admin',
    password: 'Demo@123',
    server: 'SQL5080.site4now.net',
    database: 'DB_A686D5_SyedXploria',
    multipleStatements: true
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
function createUserTable() {
    sql.connect(config, err => {
        new sql.Request()
            .query("CREATE TABLE [dbo].[users]([user_id] [int] IDENTITY(1,1) NOT NULL,[name] [nchar](30) NULL,[avatar_url] [nchar](100) NULL, [created] [datetime] NULL, [isActive] [bit] NULL, CONSTRAINT [PK_users] PRIMARY KEY CLUSTERED ( [user_id] ASC )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]) ON [PRIMARY]");
    });
}
function createChatRoomTable() {
    sql.connect(config, err => {
        new sql.Request()
            .query("CREATE TABLE [dbo].[chat_room]([chat_room_id] [int] IDENTITY(1,1) NOT NULL,[chat_room_name] [nchar](60) NULL,[avatar_url] [nchar](100) NULL,[isGroup] [bit] NULL,[isActive] [bit] NULL,[created] [datetime] NULL,[modified] [datetime] NULL,[last_message] [nchar](30) NULL,[creator_id] [int] NULL,CONSTRAINT [PK_chat_room] PRIMARY KEY CLUSTERED ([chat_room_id] ASC )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]) ON [PRIMARY]; ALTER TABLE [dbo].[chat_room]  WITH CHECK ADD  CONSTRAINT [FK_chat_room_chat_room] FOREIGN KEY([creator_id]) REFERENCES [dbo].[users] ([user_id]); ALTER TABLE [dbo].[chat_room] CHECK CONSTRAINT [FK_chat_room_chat_room];");
    });
}

function createParticipantsTable() {
    sql.connect(config, err => {
        new sql.Request()
            .query("CREATE TABLE [dbo].[participants]( [participant_id] [int] IDENTITY(1,1) NOT NULL, [user_id] [int] NULL, [chatRoom_id] [int] NULL, [created] [datetime] NULL, [description] [nchar](50) NULL, CONSTRAINT [PK_participants] PRIMARY KEY CLUSTERED  ( [participant_id] ASC )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY] ) ON [PRIMARY]; ALTER TABLE [dbo].[participants]  WITH CHECK ADD  CONSTRAINT [FK_participants_chat_room] FOREIGN KEY([chatRoom_id]) REFERENCES [dbo].[chat_room] ([chat_room_id]); ALTER TABLE [dbo].[participants] CHECK CONSTRAINT [FK_participants_chat_room]; ALTER TABLE [dbo].[participants]  WITH CHECK ADD  CONSTRAINT [FK_participants_users] FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([user_id]); ALTER TABLE [dbo].[participants] CHECK CONSTRAINT [FK_participants_users];");
    });
}

function createRecipientsTable() {
    sql.connect(config, err => {
        new sql.Request()
            .query("CREATE TABLE [dbo].[recipients]( [recipient_id] [int] IDENTITY(1,1) NOT NULL, [user_id] [int] NULL, [chat_id] [int] NULL, [isRead] [bit] NULL, [created] [datetime] NULL, [chatRoom_id] [int] NULL, CONSTRAINT [PK_recipients] PRIMARY KEY CLUSTERED ( [recipient_id] ASC )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY] ) ON [PRIMARY]; ALTER TABLE [dbo].[recipients]  WITH CHECK ADD  CONSTRAINT [FK_recipients_chat_room] FOREIGN KEY([chatRoom_id]) REFERENCES [dbo].[chat_room] ([chat_room_id]); ALTER TABLE [dbo].[recipients] CHECK CONSTRAINT [FK_recipients_chat_room]; ALTER TABLE [dbo].[recipients]  WITH CHECK ADD  CONSTRAINT [FK_recipients_chats] FOREIGN KEY([chat_id]) REFERENCES [dbo].[chats] ([chat_id]); ALTER TABLE [dbo].[recipients] CHECK CONSTRAINT [FK_recipients_chats]; ALTER TABLE [dbo].[recipients]  WITH CHECK ADD  CONSTRAINT [FK_recipients_users] FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([user_id]); ALTER TABLE [dbo].[recipients] CHECK CONSTRAINT [FK_recipients_users];");
    });
}

function createChatsTable() {
    sql.connect(config, err => {
        new sql.Request()
            .query("CREATE TABLE [dbo].[chats]( [chat_id] [int] IDENTITY(1,1) NOT NULL, [message] [nchar](100) NULL, [chatRoom_id] [int] NULL, [created] [datetime] NULL, [sender_id] [int] NULL, CONSTRAINT [PK_chats] PRIMARY KEY CLUSTERED ([chat_id] ASC )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY] ) ON [PRIMARY]; ALTER TABLE [dbo].[chats]  WITH CHECK ADD  CONSTRAINT [FK_chats_chat_room1] FOREIGN KEY([chatRoom_id]) REFERENCES [dbo].[chat_room] ([chat_room_id]); ALTER TABLE [dbo].[chats] CHECK CONSTRAINT [FK_chats_chat_room1];ALTER TABLE [dbo].[chats]  WITH CHECK ADD  CONSTRAINT [FK_chats_users] FOREIGN KEY([sender_id]) REFERENCES [dbo].[users] ([user_id]); ALTER TABLE [dbo].[chats] CHECK CONSTRAINT [FK_chats_users];");
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
    var chatID = 1;
    var conection = new sql.connect(config, err => {
        new sql.Request()
            .input('chatRoom_id', sql.Int, chatRoom_id)
            .input('sender_id', sql.Int, sender_id)
            .input('message', sql.NVarChar, message)
            .query('INSERT INTO [chats] ([message], [chatRoom_id], [created], [sender_id]) VALUES (@message, @chatRoom_id, CURRENT_TIMESTAMP, @sender_id); SELECT @@IDENTITY AS \'identity\';',
                (err, result) => {
                    if (err) {
                        console.log("Error: " + err);
                    } else {
                        console.log(result.recordset[0]['identity']);
                        chatID = result.recordset[0]['identity'];
                        if (chatID != -1) {
                            sql.connect(config, err => {
                                new sql.Request()
                                    .input('sender_id', sql.Int, sender_id)
                                    .input('chatRoom_id', sql.Int, chatRoom_id)
                                    .query('SELECT * FROM [participants]  WHERE [user_id] != @sender_id AND [chatRoom_id] = @chatRoom_id', (err, result) => {
                                        if (err) {
                                            console.log("Error: " + err);
                                        } else {
                                            for (let index = 0; index < result.recordset.length; index++) {
                                                //console.log(result.recordset[index]['user_id']);
                                                createRecepient(result.recordset[index]['user_id'], chatID, chatRoom_id);
                                            }
                                        };
                                    });
                            });
                        }
                    };
                });
    });

}


function createNewUser(name, avatar_url) {
    sql.connect(config, err => {
        new sql.Request()
            .input('name', sql.NVarChar, name)
            .input('avatar_url', sql.NVarChar, avatar_url)
            .query('INSERT INTO [users] ( [name], [avatar_url], [created], [isActive]) VALUES (@name, @avatar_url, CURRENT_TIMESTAMP, 0)');
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

function getMessages(chatRoom_id) {

}

function createRecepient(user_id, chat_id, chatRoom_id) {
    sql.connect(config, err => {
        new sql.Request()
            .input('user_id', sql.Int, user_id)
            .input('chat_id', sql.Int, chat_id)
            .input('chatRoom_id', sql.Int, chatRoom_id)
            .query('INSERT INTO [recipients] ( [user_id], [chat_id], [isRead], [created], [chatRoom_id]) VALUES (@user_id, @chat_id, 0, CURRENT_TIMESTAMP, @chatRoom_id)');
    });
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
    //createNewUser('Kevin','https://randomuser.me/api/portraits/men/60.jpg')
    //createChatRoom('Kevin_Tom','',false,false,4)
    //sendMessage('{"text": "Hello Boss1"}', 1, 1)
    //printStatus();
    //createUserTable();
    //createChatRoomTable();
    //createParticipantsTable();
    createRecipientsTable();
    //createChatsTable();
    console.log('listening on *:3000');
    //getAllChats(1);
});