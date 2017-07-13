const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// let data = {    
//     id: 10
// };

// let token = jwt.sign(data, '123abc');
// console.log(token);
// jwt.verify

// let msg = 'I am user #4';
// let hash = SHA256(msg).toString();

// console.log(`Message: ${msg}`);
// console.log(`Hash: ${hash}`);

// let data = {
//     id: 4
// };
// let token = {
//     data,
//     hash: SHA256(JSON.stringify(data)).toString()
// }

let password = '123abc!';
bcrypt.genSalt(10)
    .then(salt => bcrypt.hash(password, salt))
    .then(console.log)
    .catch(console.log);

let hashedPass = '$2a$10$VlrA1Sod8jScj5YYBPOzRuAm9i1cy4qfwYEtpiKESTRPpVXc6fosG';
bcrypt.compare(password, hashedPass).then(console.log);