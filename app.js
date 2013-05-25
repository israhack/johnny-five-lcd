var express = require('express'),
	app = express(),

	five = require("johnny-five"),
	board, lcd, messages = [];

app.set('port', 3000);
app.use(express.bodyParser());
app.use(express.static(__dirname+ '/public'));
app.post('/', function(req, res) {
	if (req.body.message) {
		messages.push(req.body.message);
	}
	res.send(req.body);
});

app.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});


board = new five.Board();
board.on("ready", function() {
	lcd = new five.LCD({
		pins: [ 7, 8, 9, 10, 11, 12 ],
		rows: 2,
		cols: 16
	});

	var currentColumn = lcd.cols-1,
		currentMessage = 0,
		loop = null;

	function printMessage(msg, pos) {
		var m = msg.split("\n"),
			match = msg.match(/:[\w\W]+:/g);
		
		if (match) {
			for (var i=0; i<match.length; i++) {
				lcd.useChar(match[i].replace(/:/g,""));
			}
		}
		lcd.clear();
		lcd.setCursor(pos, 0).print(m[0]);
		if (m.length > 1) {
			lcd.setCursor(pos, 1).print(m[1]);
		}
	}

	function process() {
		if (messages.length == 0) return false;
		
		printMessage(messages[currentMessage], currentColumn);
		if (--currentColumn < 0) {
			clearInterval(loop);
			board.wait(3000, function(){
				currentColumn = lcd.cols-1;
				if (++currentMessage == messages.length) {
					currentMessage = 0;
				}
				loop = setInterval(process, 100);
			});
		}
	}

	lcd.on("ready", function() {
		loop = setInterval(process, 100);
	});

	this.repl.inject({
		lcd: lcd,
		messages: messages
	});
});
