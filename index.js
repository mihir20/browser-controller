const executor = require('child_process');
const Promise = require('bluebird');
const lz4 = require('lz4');
const fs = require('fs');

const cleanupChrome = ()=>{
    executor.exec('rm -rf /home/o_0/.config/google-chrome/Default/History');//history bookmarks
    executor.exec('rm -rf /home/o_0/.config/google-chrome/Default/Cookies');//history bookmarks
    executor.exec('rm -rf /home/o_0/.config/google-chrome/Default/Cache');//history bookmarks
    executor.exec('rm -rf /home/o_0/.config/google-chrome/Default/Bookmarks');//history bookmarks
    executor.exec('rm -rf /home/o_0/.config/google-chrome/Default/Favicons');//history bookmarks
    executor.exec('rm -rf /home/o_0/.config/google-chrome/Default/Login\ Data');//history bookmarks
    executor.exec('rm -rf /home/o_0/.config/google-chrome/Default/Sessions/*');//history bookmarks
    executor.exec('rm -rf /home/o_0/.config/google-chrome/Default/Extensions/*');//history bookmarks
    
}

const cleanupFirefox = ()=>{
    executor.exec('rm -rf /home/o_0/.mozilla/firefox/509i159i.default-release/places.sqlite');//history bookmarks
    executor.exec('rm -rf /home/o_0/.mozilla/firefox/509i159i.default-release/bookmarkbackups/*');//history bookmarks
    executor.exec('rm -rf /home/o_0/.mozilla/firefox/509i159i.default-release/cookies.sqlite');//history bookmarks
    executor.exec('rm -rf /home/o_0/.mozilla/firefox/509i159i.default-release/formhistory.sqlite');//history bookmarks
    executor.exec('rm -rf /home/o_0/.mozilla/firefox/509i159i.default-release/addons.sqlite');//history bookmarks
    executor.exec('rm -rf /home/o_0/.mozilla/firefox/509i159i.default-release/extensions.sqlite');//history bookmarks
    executor.exec('rm -rf /home/o_0/.mozilla/firefox/509i159i.default-release/favicons.sqlite');//history bookmarks
    executor.exec('rm -rf /home/o_0/.mozilla/firefox/509i159i.default-release/prefs.js');//history bookmarks

    executor.exec('rm -rf /home/o_0/.mozilla/firefox/509i159i.default-release/logins.json');//history bookmarks
    executor.exec('rm -rf /home/o_0/.mozilla/firefox/509i159i.default-release/key4.db');//history bookmarks
    executor.exec('rm -rf /home/o_0/.mozilla/firefox/509i159i.default-release/sessionstore-backups/*');//history bookmarks
    executor.exec('rm -rf /home/o_0/.mozilla/firefox/509i159i.default-release/downloads.sqlite');//history bookmarks
}

const parser = (inputBuffer,res) =>
  new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(inputBuffer)) {
      return reject(new Error('Input is not of type Buffer'));
    }

    // Verifiy custom Mozilla LZ4 header / Magic number
    // if (inputBuffer.slice(0, 8).toString() !== 'mozLz40\0') {
    //   return reject(new Error('Input does not seem to be jsonlz4 format'));
    // }

    const outputBuffer = new Buffer(inputBuffer.readUInt32LE(8));
    lz4.decodeBlock(inputBuffer, outputBuffer, 12);

    resolve(JSON.parse(outputBuffer.toString()));
  });
  const mozila = (res) => {
      let buf = fs.readFileSync('/home/o_0/.mozilla/firefox/509i159i.default-release/sessionstore-backups/recovery.jsonlz4')
    //  console.log(parser(buf))
    parser(buf).then((data)=>{
        let ind = data.windows[0].selected;
        let histLen = data.windows[0].tabs[ind-1].entries.length
        console.log(data.windows[0].tabs[ind-1].entries[histLen-1].url)
        res.send(data.windows[0].tabs[ind-1].entries[histLen-1].url)
    },()=>res.send("error"));
  };

  const chrome = (res) => {
    let buf = fs.readFileSync('/home/o_0/.config/google-chrome/Default/Sessions/Session_13272803570459045')
    parser(buf).then((data)=>{
        // let ind = data.windows[0].selected;
        // let histLen = data.windows[0].tabs[ind-1].entries.length
        console.log(data)
        // res.send(data.windows[0].tabs[ind-1].entries[histLen-1].url)
    });
  }

const startBrowser = (browser,url)=>{
    executor.exec(browser+" "+url);
}

const stopBrowser = (browser)=>{
    executor.exec("pkill "+browser);
}



const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/start', (req, res) => {
    console.log(req.query);
    startBrowser(req.query.browser,req.query.url)
    res.send(`Started ${req.query.browser} url:${req.query.url}`)
})

app.get('/stop', (req, res) => {
    console.log(req.query);
    stopBrowser(req.query.browser,req.query.url)
    res.send(`Stopped ${req.query.browser}`)
})

app.get('/cleanup', (req, res) => {
    if(req.query.browser == 'firefox'){
        cleanupFirefox();
    }else{
        cleanupChrome();
    }
    res.send('Data Cleaned...')
})

app.get('/geturl', (req, res) => {
    // res.send('Hello World!')
    if(req.query.browser == 'firefox'){
        mozila(res);
    }else if(req.query.browser == 'chrome'){
        let output = executor.execSync(`chrome-session-dump -active /home/o_0/.config/google-chrome/Default/Sessions`)
        // console.log(output.toString());
        res.send(output.toString());
    }
    else res.send("error")
})
  

app.listen(port, () => {
    // mozila();
    // chrome();
  console.log(`app listening at http://localhost:${port}`)
//   executor.exec(`strings /home/o_0/.config/google-chrome/Default/Sessions | grep -E '^https?://''`)
})
