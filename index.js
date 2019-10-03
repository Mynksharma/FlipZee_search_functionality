const express=require('express');
const path=require('path');
const hbs=require('hbs');
const mysql=require('mysql');
const natural=require('natural');
const app=express();
const port=process.env.PORT || 3000;
app.use(express.static(path.join(__dirname,'/public')));
app.set('view engine','hbs');
const db=mysql.createConnection({ 
    host:"localhost",
    user:"root",
    password:"",
    database:"flipzee"
    
});
db.connect((err)=>{
    if(err){
        throw err;
    }
    console.log("mysql connected..");
});
app.get('/',(req,res)=>{
    console.log('hello hb')
    res.render('index');
})
app.get('/index',(req,res)=>{
    console.log('hello hb')
    res.render('index');
})
app.get('/search',(req,res)=>{
    console.log('hello hb')
    res.render('search');
})
app.get('/getdata',(req,res)=>{
    let sql="select movie,alt_text,language from `table 1`";
    
    db.query(sql,(err,result)=>{
        if(err) throw err;
       var name,fraction,soundsimilar,name1,reqstring1,language,approx,alt_text,rest;
       var a=JSON.stringify(result);
        var data=JSON.parse(a);
        console.log(data.length);
        var metaphone = natural.Metaphone;
           for(var i=0;i<data.length;i++){
            name=data[i]['movie'];alt_text=data[i]['alt_text'];rest=alt_text.split(",");rest.unshift(name);
            var reqstring=req.query.data;
            natural.PorterStemmer.attach();
            reqstring1=reqstring.tokenizeAndStem().join(" ");
            metaphone.attach();
            var soundreq=reqstring.tokenizeAndPhoneticize(); 
            var countx=0,soundflag=0,fractionx=0;
           for(nam of rest){
            var count=0;var fraction=0;
           soundsimilar=(metaphone.process(reqstring)===metaphone.process(nam))? 1:0;
            var soundname=nam.tokenizeAndPhoneticize();
            for(x of soundreq){
                for(y of soundname){
                   if(x===y) count++;
                }
            }
               if(count>countx) countx=count;if(soundsimilar==1) soundflag=1;

               name1=nam.tokenizeAndStem().join(" ");
               fraction=natural.JaroWinklerDistance(reqstring1,name1);
                if(fraction>fractionx) fractionx=fraction;


        }
              language=data[i]['language'];

            approx=1*(soundflag.toString()+countx.toString()+fractionx.toString()); 
              data[i]={name,rest,language,fractionx,soundflag,countx,approx};
            }
            var toplist=[];
           data.sort(function(a, b) {
                return b['approx'] - a['approx'];
              });
              for(var i=0;i<10;i++){
                  toplist[i]=data[i];
              }
            res.send(toplist);
        });
        
    })
app.listen(port,()=>{console.log('server is on port '+port)});
