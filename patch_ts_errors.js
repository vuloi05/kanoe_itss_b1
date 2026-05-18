const fs = require('fs');

function patchLearner() {
    const file = 'c:\\DU_AN\\kanoe_itss_b1\\frontend\\src\\app\\learner\\messages\\page.tsx';
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/newMsg\.sentAt/g, "newMsg.timestamp");
    content = content.replace(/sentAt:/g, "timestamp:");
    content = content.replace(/msg\.sentAt/g, "msg.timestamp");
    fs.writeFileSync(file, content, 'utf8');
}

function patchPartner() {
    const file = 'c:\\DU_AN\\kanoe_itss_b1\\frontend\\src\\app\\partner\\messages\\page.tsx';
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/newMsg\.sentAt/g, "newMsg.timestamp");
    content = content.replace(/sentAt:/g, "timestamp:");
    content = content.replace(/msg\.sentAt/g, "msg.timestamp");
    content = content.replace(/ === "CONFIRMED" \|\| msg.lessonStatus === "ACCEPTED"/g, ' === "ACCEPTED"');
    fs.writeFileSync(file, content, 'utf8');
}

patchLearner();
patchPartner();
console.log("Fixed typescript errors");
