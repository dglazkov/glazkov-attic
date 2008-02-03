openDatabase('test').transaction(function(tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS Pages(title text, lastUpdated number)', 
		[]);
	tx.executeSql('INSERT INTO Pages VALUES(?, ?)', 
		[ 'some title', new Date().getTime() ]);
	tx.executeSql('SELECT * FROM Pages;', 
		[],
		function(tx, rs) {
			var rows = rs.rows;
			console.info('Pages:');
			for(var i = 0; i < rows.length; i++) {
				var row = rows.item(i);
				console.info('title =', row.title, 
					'lastUpdated =', row.lastUpdated);
			}
		},
		function(err) {
			console.warn('errorCallback', err.message);
		});
});


openDatabase('test').transaction(function(tx) {
	tx.executeSql('DROP TABLE Pages', 
		[]);
});

console.log('1');
openDatabase('test').transaction(function(tx) {
	console.log('2');
	tx.executeSql('CREATE TABLE IF NOT EXISTS Pages(title TEXT, lastUpdated INTEGER)', 
		[]);
	console.log('3');
	tx.executeSql('INSERT INTO Pages VALUES(?, ?)', 
		[ 'some title', new Date().getTime() ]);
	console.log('4');
	tx.executeSql('SELECT count(*) FROM Pages;', 
		[],
		function(tx, rs) {
			console.info('5');
		});
	console.log('6');
	tx.executeSql('SELECT * FROM Pages;', 
		[],
		function(tx, rs) {
			console.info('7');
		});
	console.log('8');
	tx.executeSql('SELECT title FROM Pages ORDER BY lastUpdated DESC;', 
		[],
		function(tx, rs) {
			console.info('9');
		});
	console.log('10');
});
console.log('11');
