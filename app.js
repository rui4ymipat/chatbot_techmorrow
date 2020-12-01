const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const fs = require('fs');
const { isBoolean } = require('util');
const app = express()
const port = process.env.PORT || 4000
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.get('/addData/:temp/:humid/:light', (req, res) => {
    const temp = req.params.temp
    const humid = req.params.humid
    const light = req.params.light
    const dateTime = new Date()
    let setHour = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 1, 2, 3, 4, 5, 6]
    let time = `${setHour[dateTime.getHours()]}:${dateTime.getMinutes()}:${dateTime.getSeconds()}`
    let date = `${dateTime.getDate()}/${dateTime.getMonth() + 1}/${dateTime.getFullYear()}`
    fs.appendFile('data.txt', `${date},${time},${temp},${humid},${light}+`, (err) => { })
    let text = fs.readFileSync("data.txt", 'utf-8');
    fs.readFile("data.txt", (err, data) => {

        if (err) return console.error(err)
        var msg1 = data.toString().split('+')
        var msg2 = msg1[msg1.length - 2].split(",", 5)
        let linemsg = `Date : ${msg2[0]}, Time : ${msg2[1]}, Temp : ${msg2[2]}, Humid : ${msg2[3]}, Light : ${msg2[4]} `
        res.send(linemsg)
    });
})

app.get('/addSoil/:soil', (req, res) => {
    const soil = req.params.soil
    const dateTime = new Date()
    let setHour = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 1, 2, 3, 4, 5, 6]
    let time = `${setHour[dateTime.getHours()]}:${dateTime.getMinutes()}:${dateTime.getSeconds()}`
    let date = `${dateTime.getDate()}/${dateTime.getMonth() + 1}/${dateTime.getFullYear()}`
    fs.appendFile('soil.txt', `${date},${time},${soil}+`, (err) => { })
    fs.readFile("soil.txt", (err, data) => {
        if (err) return console.error(err)
        var msg1 = data.toString().split('+')
        var msg2 = msg1[msg1.length - 2].split(",", 3)
        let linemsg = `Date : ${msg2[0]}, Time : ${msg2[1]}, Soil : ${msg2[2]} `
        res.send(linemsg)
    });
})

app.post('/webhook', (req, res) => {
    let reply_token = req.body.events[0].replyToken
    let msg = req.body.events[0].message.text
    reply(reply_token, msg)
    res.sendStatus(200)
})
app.listen(port)
function reply(reply_token, msg) {

    if (msg == 'ดูข้อมูลระบบ') {
        fs.readFile("data.txt", (err, data) => {
            if (err) return console.error(err);
            msg1 = data.toString().split('+')
            if (data.length > 4) {
                msg2 = msg1[msg1.length - 2].split(",", 5)
                fs.readFile("soil.txt", (err1, data1) => {
                    if (err1) return console.error(err1)
                    var soil1 = data1.toString().split('+')
                    soil = soil1[soil1.length - 2].split(",", 3)
                    let linemsg = `Date : ${msg2[0]}, Time : ${msg2[1]}, Temp : ${msg2[2]}\n Humid : ${msg2[3]}, Soil : ${soil[2]} , Light : ${msg2[4]} `
                    sendReply(linemsg, reply_token);
                })
            }
            else{
                let linemsg = 'ขณะนี้ยังไม่สามารถติดต่อกับอุปกรณ์ได้ \nโปรดรอสักครู่แล้วลองใหม่อีกครั้ง\n\uDBC0\uDCA4\uDBC0\uDCA4\uDBC0\uDCA4'
                sendReply(linemsg, reply_token);
            }

        })

    }
    else if (msg == 'เช็คสุขภาพฟาร์ม') {
        fs.readFile("data.txt", (err, data) => {
            if (err) return console.error(err);
            if (data.length > 4) {
                msg1 = data.toString().split('+')
                msg2 = msg1[msg1.length - 2].split(",", 5)
                fs.readFile("soil.txt", (err1, data1) => {
                    if (err1) return console.error(err1)
                    var soil1 = data1.toString().split('+')
                    soil = soil1[soil1.length - 2].split(",", 3)
                    // let linemsg = `Date : ${msg2[0]}, Time : ${msg2[1]}, Temp : ${msg2[2]}\n Humid : ${msg2[3]}, Soil : ${soil[2]} , Light : ${msg2[4]} `
                    if (soil[2] > 70) {
                        h_soil = 'ดีมาก'
                    }
                    else if (soil[2] >= 40 && soil[2] <= 70) {
                        h_soil = 'ดินแห้ง'
                    }
                    else if (soil[2] < 40) {
                        h_soil = 'ดินแห้งมาก'
                    }

                    if (msg2[4] > 500) {
                        h_light = 'แดดแรงมาก'
                    }
                    else if (msg2[4] >= 250 && msg2[4] <= 500) {
                        h_light = 'แสงแดดดี'
                    }
                    else if (msg2[4] >= 50 && msg2[4] < 250) {
                        h_light = 'แดดอ่อน'
                    }
                    else if (msg2[4] < 50) {
                        h_light = 'ไม่มีแดด'
                    }
                    let linemsg = `สุขภาพฟาร์มของคุณ 
                      \nแสง           ${msg2[4]} Watt/sq.m
                      \nอุณหภูมิ         ${msg2[2]} °C
                      \nความชื้นในอากาศ ${msg2[3]} %RH
                      \nความชื้นในดิน    ${soil[2]} %W/W
                      \n\nสภาพแวดล้อมโดยรวม : ${h_soil} ${h_light}`
                      sendReply(linemsg, reply_token);
                })
            }
            else {
                let linemsg = 'ขณะนี้ยังไม่สามารถติดต่อกับอุปกรณ์ได้ \nโปรดรอสักครู่แล้วลองใหม่อีกครั้ง\n\uDBC0\uDCA4\uDBC0\uDCA4\uDBC0\uDCA4'
                sendReply(linemsg, reply_token);
            }
        })
    }

    else if (msg == 'การทำงานวันนี้') {
        fs.readFile("data.txt", (err, data) => {
            if (err) return console.error(err);
            const dateTime = new Date()
            if (data.length > 4) {
                let setHour = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 1, 2, 3, 4, 5, 6]
                let time = `${setHour[dateTime.getHours()]}:${dateTime.getMinutes()}:${dateTime.getSeconds()}`
                msg1 = data.toString().split('+')
                msg2 = msg1[msg1.length - 2].split(",", 5)
                fs.readFile("soil.txt", (err1, data1) => {
                    if (err1) return console.error(err1)
                    var soil1 = data1.toString().split('+')
                    soil = soil1[soil1.length - 2].split(",", 3)
                    if (setHour[dateTime.getHours()] >= 8 && setHour[dateTime.getHours()] < 16) {
                        let linemsg = `ขณะนี้เวลา ${time} นาฬิกา
                             \nเราให้น้ำปริมาณ 0.17 ลิตรต่อต้นเมื่อ  8:00 นาฬิกา 
                             \nจะทำการให้น้ำอีกครั้งตอน 16:00 นาฬิกา`
                             sendReply(linemsg, reply_token);
                    }
                    else {
                        let linemsg = `ขณะนี้เวลา ${time} นาฬิกา
                             \nเราให้น้ำปริมาณ 0.17 ลิตรต่อต้นเมื่อ  16:00 นาฬิกา 
                             \nจะทำการให้น้ำอีกครั้งตอน 8:00 นาฬิกา`
                             sendReply(linemsg, reply_token);
                    }
                    // let linemsg = `Date : ${msg2[0]}, Time : ${msg2[1]}, Temp : ${msg2[2]}\n Humid : ${msg2[3]}, Soil : ${soil[2]} , Light : ${msg2[4]} `
                })
            }
            else {
                let linemsg = 'ขณะนี้ยังไม่สามารถติดต่อกับอุปกรณ์ได้ \n โปรดรอสักครู่แล้วลองใหม่อีกครั้ง'
                sendReply(linemsg, reply_token);
            }
        })
    }
    else {
        let linemsg = 'ขณะนี้กำลังปิดปรับปรุงระบบ โปรดติดต่อได้ที่เว็บไซต์'
        sendReply(linemsg, reply_token);
    }

    // let headers = {
    //     'Content-Type': 'application/json',
    //     'Authorization': 'Bearer {WGlh8Gz0yU+6YiFw/ihjJXhc4W20kqmW0T4Ze/Hzqcwlg6AamRU8Oo/+6RMayR1OISKUIyWUxIfuUfRKS3CvPc9zRh/IkVYPvAPVT/blz+yKswxCnbCLGwpOCWC8zE4v1lwkP4UQeznFYQNYStVpEgdB04t89/1O/w1cDnyilFU=}'
    // }
    // let body = JSON.stringify({
    //     replyToken: reply_token,
    //     messages: [{
    //         type: 'text',
    //         text: let linemsg
    //     }]
    // })

    // request.post({
    //     url: 'https://api.line.me/v2/bot/message/reply',
    //     headers: headers,
    //     body: body
    // }, (err, res, body) => {
    //     console.log('status = ' + res.statusCode);
    // });
}

function sendReply(linemsg, reply_token) {
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {WGlh8Gz0yU+6YiFw/ihjJXhc4W20kqmW0T4Ze/Hzqcwlg6AamRU8Oo/+6RMayR1OISKUIyWUxIfuUfRKS3CvPc9zRh/IkVYPvAPVT/blz+yKswxCnbCLGwpOCWC8zE4v1lwkP4UQeznFYQNYStVpEgdB04t89/1O/w1cDnyilFU=}'
    }
    let body = JSON.stringify({
        replyToken: reply_token,
        messages: [{
            type: 'text',
            text: linemsg
        }]
    })

    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode);
    });
}
// function reply(reply_token, msg) {
//     let headers = {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer {WGlh8Gz0yU+6YiFw/ihjJXhc4W20kqmW0T4Ze/Hzqcwlg6AamRU8Oo/+6RMayR1OISKUIyWUxIfuUfRKS3CvPc9zRh/IkVYPvAPVT/blz+yKswxCnbCLGwpOCWC8zE4v1lwkP4UQeznFYQNYStVpEgdB04t89/1O/w1cDnyilFU=}'
//     }
//     let body = JSON.stringify({
//         replyToken: reply_token,
//         messages: [{
//             type: 'text',
//             text: msg
//         }]
//     })
//     request.post({
//         url: 'https://api.line.me/v2/bot/message/reply',
//         headers: headers,
//         body: body
//     }, (err, res, body) => {
//         console.log('status = ' + res.statusCode);
//     });
// }