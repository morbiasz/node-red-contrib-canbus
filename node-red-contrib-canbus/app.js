//var can_send = require('./canutils/cansend.js');
var config = require('./config/canconfig.js');

var can = require('socketcan');
var random = require('random-js');	//uses native engine
//function CanSendNode(n) {
 //   RED.nodes.createNode(this,n);

this.config = config;//RED.nodes.getNode(n.config);
if(this.config)
        this.channel = this.config.channel;
else
    this.channel = "vcan0";


    this.channel = "vcan0";

//this.canid=0x5125;
//this.payload= [15,16,8,9,78]; //n.payload;

    var node = this;

console.log("id="+this.canid+",channel="+this.channel);
try {
    var channel = can.createRawChannel(""+this.channel, true);
}catch(ex) {
    console.log("channel not found:"+this.channel);
}
if(channel)
{
    channel.start();
    var frame={};
    var msg={};
        // respond to inputs....
       // this.on('input', function (msg) 
       {
        msg.channel=this.channel;
        frame.canid=0;
        frame.dlc=0;
        frame.ext=false;
        frame.remote=false;

        msg.payload="123#R5";
        if(msg.canid)
        {
            frame.canid=parseInt(msg.canid);
        }
        else if(this.canid)
        {
            frame.canid=parseInt(this.canid);
        }	
        /*--------------------------------------------------------*/
        if(msg.payload && msg.payload.indexOf("#")!=-1 && frame.canid==0)
        {
            frame.canid=parseInt(msg.payload.split("#")[0]);
            if(frame.canid >0x7FF)
                frame.ext =true;
            else
                frame.ext =false;

            var text = msg.payload.split("#")[1];
            if(text[0]=="R")
            {
                console.log("Ramka remote");
            }
            else
            {
                console.log("Ramka zwykła: "+text.length);
            }
            frame.data=new Buffer(msg.payload.split("#")[1],'hex');
            frame.dlc=frame.data.length;
            if(frame.data.length == 0)
                frame.remote=true;
            else
                frame.remote=false;
        }
        else if(msg.payload) 
        {
            frame.data=new Buffer(msg.payload);
            frame.dlc=frame.data.length;

            if(frame.data.length == 0)
                frame.remote=true;
            else
                frame.remote=false;
        }
        else if(this.payload)
        {
            frame.data=new Buffer(this.payload);
            frame.dlc=frame.data.length;


            if(frame.data.length == 0)
                frame.remote=true;
            else
                frame.remote=false;
        }
        else	 //no msg.payload and this.data is empty
        {
            frame.dlc=random.integer(1,8);
            frame.data=new Buffer(frame.dlc);
            for(var i=0;i<frame.dlc;i++)
                frame.data[i]=random.integer(65,90);
        //random.integer(1,255),random.integer(48,57),random.integer(96,121)
        }
        if(frame.canid==0)   //canid is not yet set
        {
            frame.canid=random.integer(1,4095);
        }
        if(frame.canid >0x7FF)
            frame.ext =true;
        else
            frame.ext =false;

        console.log("canid:"+frame.canid+",data:"+frame.data+",dlc:"+frame.dlc+",remote:"+frame.remote+",ext:"+frame.ext);
        if(frame.dlc<=8)	//try-catch?
            channel.send({ id: frame.canid,
                ext: frame.ext,
                remote: frame.remote,
                data:frame.data });
        else
            console.log("frame data is too long");
    };
    //TODO:support for extended frames, other cansend options
       // this.on("close", function() {
       // channel.stop();
       // });
}
