var g_sequences = [];
var g_A;

function dumpVector(V) {
  var table = $("<table></table>");

  for (var row_key in V) {
	var val = (Math.round(V[row_key] * 1000)/1000).toFixed(3);
	table.append($("<tr></tr>").append($("<th></th>").text(row_key)).append($("<td></td>").text(val)));
  }
  $(".inner_p").append(table);
}

function dumpMatrix(M, ind) {
  var table = $("<table></table>");

  // Find row and column keys.
  var row_keys = {};
  var col_keys = {};
  for (var row_key in M) {
    row_keys[row_key] = true;
    for (var col_key in M[row_key]) {
      col_keys[col_key] = true;
    }
  }

  // Create head row.
  var head_tr = $("<tr></tr>").append($("<th></th>  "));
  for (var col_key in col_keys) {
    head_tr.append($("<th></th>").text(col_key));  
  }
  table.append(head_tr);

  // Create other rows.
  for (var row_key in row_keys) {
    var tr = $("<tr></tr>").append($("<th></th>").text(row_key));
    for (var col_key in col_keys) {
    	var val;
    	if(ind == 4)
    		val = Math.round(M[row_key][col_key]);
    	else
    		val = (Math.round(M[row_key][col_key] * 1000)/1000).toFixed(3); //zaokraglenie do trzech miejsc po przecinku
    	tr.append($("<td></td>").text(val));
    }
    table.append(tr);
  }
  
  //gdzie wstawiæ macierz
  switch(ind) {
  case 1:
	  $(".inner_a").append(table);
      break;
  case 2:
	  $(".inner_q").append(table);
      break;
  case 4:
	  $(".inner_e").append(table);
      break;
  default: //nie powinno sie zdarzyæ
	  $("body").append(table);
  } 
}

document.addEventListener("DOMContentLoaded", function() {
  /*g_sequences.push("CCAAABAC");
  g_sequences.push("CCAABBAB");
  g_sequences.push("BBCACBAB");
  g_sequences.push("CBCACBAB");
  g_sequences.push("CCCABBAB");
  g_sequences.push("CCCBBBAB");*/ 

  $("#add_sequence").click(function() {
	var new_seq = $("#sequence").val();
	var len = g_sequences.length;
	//czy sekwencja poprawna
	if (new_seq.length==0 || (len!=0 && new_seq.length!=g_sequences[len-1].length)) {
		$("#dialog").dialog('open');
		return;
	}
	g_sequences.push(new_seq);
    $( ".inner_beg" ).append( $("<p></p>").text(new_seq) );
    if(g_sequences.length == 1) {
    	enableButtons();
    	$( "#read_file" ).button( "disable" );
    }
  });
  
  $("#clear").click(function() {
	  clearDisable();
	  $( "#read_file" ).button( "enable" );
	  $( "#add_sequence" ).button( "enable" );
	  });
  
  $("#new").click(function() {
	  clearDisable();
	  $( "#accordion" ).accordion( "option", "active", 0 );
	  $( "#read_file" ).button( "enable" );
	  $( "#add_sequence" ).button( "enable" );
	  });
  
  $("#read_file").click(function() {
   	  $.get('dane.txt', function(data) {
   		  var lines = data.split(/\r\n|\r|\n/g);
   		  var g_len = g_sequences.length;
   		  for (var i = 0, len = lines.length; i < len; ++i) {
   			  if(lines[i].length==0 || (g_len!=0 && lines[i].length!=g_sequences[g_len-1].length)) {
   				  $("#dialog").dialog('open');
   				  return;
   			  }
   			  g_sequences.push(lines[i]);
   		  }
   		  succ = true;
   		  enableButtons();
   		  $( "#read_file" ).button( "disable" );
   		  $( "#add_sequence" ).button( "disable" );
   		  $( ".inner_beg" ).append( $("<p></p>").text("Dane zostaly pobrane z pliku."));
   	  }, 'text');  	  
});
  
  $("#calc").click(function() {
	    /* performance.now() jest dokladniejsze i nie zalezy od zegara systemowego uzytkownika,
	     * w najnowszym Firefox 34.0.5 dziala.
	     * W razie problemow uzyc Date().getMilliseconds()
	     */ 
	  	var start = performance.now();
	  	//var start = new Date().getMilliseconds();
	    var A = calculateA(g_sequences);
	    var Q = calculateQ(A);
	    var P = calculateP(Q);
	    var E = calculateE(Q, P);
		var end = performance.now();
	    //var end = new Date().getMilliseconds();
	    dumpMatrix(A, 1);
	    dumpMatrix(Q, 2);
	    dumpVector(P);
	    dumpMatrix(E, 4);
	    $( ".inner_e" ).append( $("<p></p>").text('Czas wykonania: ' + (end - start) + ' ms'));
	    $( "#accordion" ).accordion( "option", "active", 4 );
	    disableButtons();
	  });
  
  $("#calc_a").click(function() {
    dumpMatrix(calculateA(g_sequences), 1);
    $( "#accordion" ).accordion( "option", "active", 1 );
	$( this ).button( "disable" );
	$( "#calc" ).button( "disable" );
  });

  $("#calc_q").click(function() {
    dumpMatrix(calculateQ(calculateA(g_sequences)), 2);
    $( "#accordion" ).accordion( "option", "active", 2 );
	$( this ).button( "disable" );
  });

  $("#calc_p").click(function() {
    dumpVector(calculateP(calculateQ(calculateA(g_sequences))));
    $( "#accordion" ).accordion( "option", "active", 3 );
	$( this ).button( "disable" );
  });

  $("#calc_e").click(function() {
    var A = calculateA(g_sequences);
    var Q = calculateQ(A);
    var P = calculateP(Q);
    dumpMatrix(calculateE(Q, P), 4);
    $( "#accordion" ).accordion( "option", "active", 4 );
	$( this ).button( "disable" );
  })
});

function calculateA(sequences) {
  var n = sequences[0].length;
  
  // Make a set of all values.
  var values = {};
  for (var i = 0; i < n; ++i) {
    for (var j = 0; j < sequences.length; ++j) {
      values[sequences[j].charAt(i)] = true;
    }
  }

  // Init matrix A with 0s.
  var A = {};
  for (var value1 in values) {
    A[value1] = {};
    for (var value2 in values) {
      A[value1][value2] = 0;
    }
  }

  // Calculate matrix A.
  for (var i = 0; i < n; ++i) {
    for (var j = 0; j < sequences.length; ++j) {
      var c1 = sequences[j].charAt(i);
      for (var k = j + 1; k < sequences.length; ++k) {
        var c2 = sequences[k].charAt(i);
        A[c1][c2] += 1;
        A[c2][c1] += 1;
      }
    }
  }

  return A;
}

function calculateQ(A) {
  var T = 0;
  for (var row_key in A) {
    for (var col_key in A[row_key]) {
      T += A[row_key][col_key];
    }
  }

  var Q = {};
  for (var k1 in A) {
    Q[k1] = {};
    for (var k2 in A[k1]) {
      Q[k1][k2] = A[k1][k2] / T;
    }
  }
  return Q;
}

function calculateP(Q) {
  var P = {};
  for (var row_key in Q) {
    P[row_key] = Q[row_key][row_key];
    for (var col_key in Q[row_key]) {
      if (row_key != col_key) {
        P[row_key] += Q[row_key][col_key];
      }
    }
  }
  return P;
}

function log2(value) {
  return Math.log(value) / Math.log(2);
}

function calculateE(Q, P) {
  var E = {};
  for (var row_key in Q) {
    E[row_key] = {};
    for (var col_key in P) {
      E[row_key][col_key] = Math.round(2 * log2(Q[row_key][col_key] / (P[row_key] * P[col_key])));
    }
  }
  return E;
}

function clearDisable() {
	g_sequences.length = 0; 
	$(".inner_beg").empty();
	$(".inner_a").empty();
	$(".inner_q").empty();
	$(".inner_p").empty();
	$(".inner_e").empty();
	disableButtons();
}

function disableButtons() {
	$( "#calc_a" ).button( "disable" );
	$( "#calc_q" ).button( "disable" );
	$( "#calc_p" ).button( "disable" );
	$( "#calc_e" ).button( "disable" );
	$( "#calc" ).button( "disable" );
	
}

function enableButtons() {
	$( "#calc_a" ).button( "enable" );
	$( "#calc_q" ).button( "enable" );
	$( "#calc_p" ).button( "enable" );
	$( "#calc_e" ).button( "enable" );
	$( "#calc" ).button( "enable" );
}