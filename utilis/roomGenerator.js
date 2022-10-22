var md5 = require('md5');

function gererateRoom(userName, clientName){
    let names = [];
    names.push(userName);
    names.push(clientName);
    names.sort();
    const plainRoom = names[0] + names[1];

    const roomName = md5(plainRoom);
    return roomName;
}

module.exports = gererateRoom;
