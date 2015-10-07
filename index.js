/*!
 * fair-lines <https://github.com/nginz/fair-lines>
 *
 * Copyright (c) 2015, Moustafa Badawy.
 * Licensed under the MIT License.
 *
 */

var defaultWidth = 30;
var wsCollapse = true;
var lineBreakPat = /\n/g;
var multiLineBreakPat = new RegExp('\\s*(?:\n)(?:\n|\\s)*', 'g');
var re = /(\S+)\s+/;
var collapsePat = /  +/g,
    blankPat = /^\s*$/g;

function splitChunks(text, options){
  var match;
  var blocks, base = 0;
  var mo, b;
  var wrapLen = options.width || defaultWidth;
  // Split `text` by line breaks.
  blocks = [];
  multiLineBreakPat.lastIndex = 0;
  match = multiLineBreakPat.exec(text);
  while(match) {
    blocks.push(text.substring(base, match.index));
    if (options.respectNL) {
      b = 0;
      mo = lineBreakPat.exec(match[0]);
      while(mo) {
        b++;
        mo = lineBreakPat.exec(match[0]);
      }
      blocks.push({type: 'break', breaks: b});
    }
    base = match.index + match[0].length;
    match = multiLineBreakPat.exec(text);
  }
  blocks.push(text.substring(base));

  var i, j;
  var segments = blocks;
  var chunks = [];
  for (i = 0; i < segments.length; i++) {
    var segment = segments[i];
    if (typeof segment !== 'string') {
      if (options.respectNL) {
        chunks.push(segment);
      }
    } else {
      if (wsCollapse) {
        segment = segment.replace(collapsePat, ' ');
      }

      var parts = segment.split(re),
          acc = [];
      for (j = 0; j < parts.length; j++) {
        var x = parts[j];
        if (x.match(blankPat)) continue;
        else { 
          acc.push(x.slice(0, wrapLen));
        }
      }
      chunks = chunks.concat(acc);
    }
  }
  return chunks;
}

function computeSlackTable(chunks, wrapLen){
  var n = chunks.length;
  var slack = [],
      i, j, k, s, ws;
  for (j = 0; j < n; j++) {
    slack[j] = new Array(n);
  }

  ws = 0;
  for (j = 0; j < n; j++) {
    slack[0][j] = ws = ws + chunks[j].length;
  }
  for (i = 1; i < n; i++) {
    for (k = i; k < n; k++) {
      slack[i][k] = slack[0][k] - slack[0][i-1];
    }
  }
  // Compute slack squares
  for (i = 0; i < n; i++) {
    for (k = i; k < n; k++) {
      s = wrapLen - (slack[i][k] + (k-i));
      if (s >=0 ) {
        slack[i][k] = Math.pow(s, 2);
      }else{
        slack[i][k] = Infinity;
      }
    }
  }
  return slack;
}

function neatFormat(chunks, options){
  var wrapLen = options.width || defaultWidth;
  var n = chunks.length;
  var cost = [],
      lines = [],
      cuts = [],
      neatChunks = [];
  var i, k, ci, cik, chunk;
  var slack = computeSlackTable(chunks, wrapLen);
  for(i = 0; i < n; i++){
    ci = Infinity;
    for(k = 0; k <= i; k++){
      if (k === 0) {
        cik = slack[k][i];
      }else{
        cik = cost[k-1] + slack[k][i];
      }
      
      if (cik < ci) {
        ci = cik;
        lines[i] = k;
      }
    }
    cost[i] = ci;
  }

  i = lines.length - 1;
  while(i >= 0){
    cuts.push(lines[i])
    i = lines[i] - 1;
  }
  cuts = cuts.reverse();
  for(i = 0; i < cuts.length; i++){
    neatChunks[i] = chunks.slice(cuts[i], cuts[i+1]).join(' ');
  }

  return neatChunks;
}

function basicFormat(chunks, options){
  var wrapLen = options.width || defaultWidth;
  var curLine = 0,
    lineChunks = [],
    lines = [];

  for (i = 0; i < chunks.length; i++) {
    var chunk = chunks[i];
    if (typeof chunk !== 'string') {
      if (options.respectNL && chunk.type === 'break') {
        lines[curLine++] = lineChunks.join(' ');
        lineChunks = [];
        for (l =  0; l < chunk.breaks - 1; l++) {
          lines[curLine++] = '';
        };
      }
      continue;
    }

    while (true) {
      if (lineChunks.concat(chunk).join(' ').length > wrapLen && lineChunks.length > 0) {
        lines[curLine++] = lineChunks.join(' ');
        lineChunks = [];
        continue;
      }else{
        lineChunks = lineChunks.concat(chunk);
      }
      break;
    }
  }
  if (lineChunks.length > 0) {
    lines[curLine++] = lineChunks.join(' ');
  }
  return lines;
}

function basic(text, options) {
  var chunks, lines;
  var i;
  if (typeof text !== 'string') {
    throw new TypeError('Expected a text parameter.');
  }
  chunks = splitChunks(text, options);
  lines = basicFormat(chunks, options);
  if (options.indent) {
    var prefix = new Array(options.indent + 1).join(' ');
    for (i = lines.length - 1; i >= 0; i--) {
      lines[i] = prefix.concat(lines[i]);
    }
  }
  return lines;
}

function balanced(text, options) {
  var chunks, lines;
  var i;
  if (typeof text !== 'string') {
    throw new TypeError('Expected a text parameter.');
  }
  options.respectNL = false;
  chunks = splitChunks(text, options);
  lines = neatFormat(chunks, options);
  if (options.indent) {
    var prefix = new Array(options.indent + 1).join(' ');
    for (i = lines.length - 1; i >= 0; i--) {
      lines[i] = prefix.concat(lines[i]);
    }
  }

  return lines;
}

module.exports = {basic: basic, balanced: balanced};