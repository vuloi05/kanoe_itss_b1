const fs = require('fs');

function patchLearner() {
    const file = 'c:\\DU_AN\\kanoe_itss_b1\\frontend\\src\\app\\learner\\messages\\page.tsx';
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/_sendStatus: "queued",\n      _tempId:/g, 'type: "TEXT",\n      _sendStatus: "queued",\n      _tempId:');
    fs.writeFileSync(file, content, 'utf8');
}

function patchPartner() {
    const file = 'c:\\DU_AN\\kanoe_itss_b1\\frontend\\src\\app\\partner\\messages\\page.tsx';
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/_sendStatus: "queued",\n      _tempId:/g, 'type: "TEXT",\n      _sendStatus: "queued",\n      _tempId:');
    fs.writeFileSync(file, content, 'utf8');
}

patchLearner();
patchPartner();
console.log("Fixed typescript errors: missing type");
