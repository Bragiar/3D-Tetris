"use strict";

var canvas;
var gl;


var NumCube = 48; //fjöldi hnúta sem kassinn utan um hefur
var NumVertices = 36; //fjöldi hnúta sem kubbur hefur
var NumOutlines = 48; //fjöldi hnúta sem útlínur á kassanum hafa

var points = []; //Fylki sem heldur utan um hnútana
var colors = [
  vec4(1.0, 0.0, 0.0, 1.0 ),  // red
  vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
  vec4(0.0, 1.0, 0.0, 1.0 ),  // green
  vec4(1.0, 0.0, 1.0, 1.0 ),  // magenta
  vec4(0.0, 1.0, 1.0, 1.0 ),  // cyan
];

var isGameRunning = false;

var movement = false;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var zView = 15; //fjarlægð myndavélar frá

var origX;
var origY;
var moveX = 0;
var moveY = 0;

var tck;

var proLoc;
var mvLoc;
var colorLoc;

var modelViewMatrix;
var instanceMatrix;

var GamePoints = 0; //Stig leiksins
var pointsContainer; //cointainer sem heldur utan um stig leiks
var statusCointainer; //cointainer sem heldur utan um stöðu leiks


var indexI = -1; //númer I kubbs sem verið er að leika
var indexL = -1; //númer L kubbs sem verið er að leika
var numCubesI = 0 //fjöldi I kubba
var numCubesL = 0 //fjöldi L kubba

var typeOfCubePlaying; // I = 1, L = 2

var tresisesI = []; //fylki sem heldur utan um I kubbana
var tresisesL = []; //fylki sem heldur utan um L kubbana

var takenPositions = []; // þrívítt boolean fylki sem heldur utan um teknar stöður


var BOX_HEIGHT = 20;
var BOX_WIDHT = 6;
var BOX_LENGTH = 6;

////////////////////////////// HREYFING OG SNÚNINGUR ///////////////

//færa kubb um x ás, x er átt færslunnar á x-ás (-1,1)
function moveX(x){
  if (typeOfCubePlaying === 1) {
    tresisesL[indexL].moveX(x);
  } else {
    tresisesI[indexI].moveX(x)
  }
}
//færa kubb um y ás, fer niður um einn
function moveY(){
  if (typeOfCubePlaying === 1) {
    tresisesL[indexL].moveY();
  } else {
    tresisesI[indexI].moveY()
  }
}
//færa kubb um z ás, x er átt færslunnar á z-ás (-1,1)
function moveZ(z){
  if (typeOfCubePlaying === 1) {
    tresisesL[indexL].moveZ(z);
  } else {
    tresisesI[indexI].moveZ(z)
  }
}
//Snúa kubbi um deg gráður um x ás
function angleX(deg){
  if (typeOfCubePlaying === 1) {
    tresisesL[indexL].angleX(deg);
  } else {
    tresisesI[indexI].angleX(deg)
  }
}
//Snúa kubbi um deg gráður um y ás
function angleY(deg){
  if (typeOfCubePlaying === 1) {
    tresisesL[indexL].angleY(deg);
  } else {
    tresisesI[indexI].angleY(deg)
  }
}
//Snúa kubbi um deg gráður um z ás
function angleZ(deg){
  if (typeOfCubePlaying === 1) {
    tresisesL[indexL].angleZ(deg);
  } else {
    tresisesI[indexI].angleZ(deg)
  }
}
// breytir gráðum í radíana
function toRadians (angle) {
  return angle * (Math.PI / 180);
}
// Snúningsfylki sem snýr vector um deg gráður um x ás
function rotX(vector,deg){
  var newVector = [];
  deg = toRadians(deg);
  newVector[0] = vector[0];
  newVector[1] = vector[1]*Math.cos(deg) - vector[2]*Math.sin(deg)
  newVector[2] = vector[1]*Math.sin(deg) + vector[2]*Math.cos(deg)

  newVector[0] = Math.round(newVector[0])
  newVector[1] = Math.round(newVector[1])
  newVector[2] = Math.round(newVector[2])
  return newVector;
}
// Snúningsfylki sem snýr vector um deg gráður um y ás
function rotY(vector,deg){
  var newVector = [];
  deg = toRadians(deg);
  newVector[0] = vector[0]*Math.cos(deg) + vector[2]*Math.sin(deg);
  newVector[1] = vector[1]
  newVector[2] = -vector[0]*Math.sin(deg) + vector[2]*Math.cos(deg)

  newVector[0] = Math.round(newVector[0])
  newVector[1] = Math.round(newVector[1])
  newVector[2] = Math.round(newVector[2])
  return newVector;
}
// Snúningsfylki sem snýr vector um deg gráður um z ás
function rotZ(vector,deg){
  var newVector = [];
  deg = toRadians(deg);
  newVector[0] = vector[0]*Math.cos(deg) - vector[1]*Math.sin(deg);
  newVector[1] = vector[0]*Math.sin(deg) + vector[1]*Math.cos(deg)
  newVector[2] = vector[2];

  newVector[0] = Math.round(newVector[0])
  newVector[1] = Math.round(newVector[1])
  newVector[2] = Math.round(newVector[2])

  return newVector;
}

///////////////// HNÚTAMYNDUN ////////////////////////////
// býr til einn kubb með svörtum útlínum
function makeCube(){
  makeCubeVertices( 1, 0, 3, 2 );
  makeCubeVertices( 2, 3, 7, 6 );
  makeCubeVertices( 3, 0, 4, 7 );
  makeCubeVertices( 6, 5, 1, 2 );
  makeCubeVertices( 4, 5, 6, 7 );
  makeCubeVertices( 5, 4, 0, 1 );

  makeBorderLinesVertices( 1, 0, 3, 2 );
  makeBorderLinesVertices( 2, 3, 7, 6 );
  makeBorderLinesVertices( 3, 0, 4, 7 );
  makeBorderLinesVertices( 6, 5, 1, 2 );
  makeBorderLinesVertices( 4, 5, 6, 7 );
  makeBorderLinesVertices( 5, 4, 0, 1 );
}
// býr til hnúta fyrir útlínur
function makeBorderLinesVertices(a, b, c, d)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, b, c, c, d, d , a];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );

    }
}

//býr til hnútana á kassanum
function makeTetrisBox()
{
    makeTetrisBoxVertices( 1, 0, 3, 2 );
    makeTetrisBoxVertices( 2, 3, 7, 6 );
    makeTetrisBoxVertices( 3, 0, 4, 7 );
    makeTetrisBoxVertices( 6, 5, 1, 2 );
    makeTetrisBoxVertices( 4, 5, 6, 7 );
    makeTetrisBoxVertices( 5, 4, 0, 1 );
}
// býr til hnúta á einum kubb
function makeCubeVertices(a, b, c, d)
{
    var vertices = [
        //main cube
        vec4( -0.5,   -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,   -0.5,  0.5, 1.0 ),
        vec4( -0.5,   -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,   -0.5, -0.5, 1.0 ),
    ];

    var vertexColors = [
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );

    }
}
//myndar rétta hnúta á kassanum
function makeTetrisBoxVertices(a, b, c, d)
{
    var vertices = [
        //main cube
        vec4( 0,   0,  6, 1.0 ),
        vec4( 0,  20,  6, 1.0 ),
        vec4(  6,  20,  6, 1.0 ),
        vec4(  6,   0,  6, 1.0 ),
        vec4( 0,   0, 0, 1.0 ),
        vec4( 0,  20, 0, 1.0 ),
        vec4(  6,  20, 0, 1.0 ),
        vec4(  6,   0, 0, 1.0 ),

    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, b, c, c, d, d , a];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );

    }
}



//////////////////// STAÐA KUBBS //////////////////////////////

// Skoðar hvort staða kubbs sé leyfileg
// (hvort hún sé fyrir utan kassann eða inni í öðrum kubb)
function checkIfallowed(){
  var allowed = true;
  for (var i = 0; i < 3; i++) {
    //Ef útfyrir kassann
    if (typeOfCubePlaying === 1) {
      var x1 = tresisesL[indexL].positions[i][0] //kubbur 1
      var x2 = tresisesL[indexL].positions[i][1] //kubbur 2
      var x3 = tresisesL[indexL].positions[i][2] //kubbur 3

    } else {
      var x1 = tresisesI[indexI].positions[i][0] //kubbur 1
      var x2 = tresisesI[indexI].positions[i][1] //kubbur 2
      var x3 = tresisesI[indexI].positions[i][2] //kubbur 3
    }
    if(x1 < 0 || x1 > 5){
      allowed = false;
      break;
    }
    else if(x3 < 0 || x3 > 5){
      allowed = false;
      break;
    }
    else if(x2 < 1 || x2 > 20){
      allowed = false;
      break;
    }
    //ef annar kubbur er á staðnum
    else if(
      takenPositions[x1][x2][x3] === true
    ){
      allowed = false;
      break;
    }
  }
  return allowed;

}
// Vistar stöðu kubbs í þrívíða boolean fylkið
function savepositions(){
  if (typeOfCubePlaying === 1) {
    for (var i = 0; i < tresisesL[indexL].positions.length; i++) {
      takenPositions
      [tresisesL[indexL].positions[i][0]]
      [tresisesL[indexL].positions[i][1]]
      [tresisesL[indexL].positions[i][2]] = true;
    }

  } else {
    for (var i = 0; i < tresisesI[indexI].positions.length; i++) {
      takenPositions
      [tresisesI[indexI].positions[i][0]]
      [tresisesI[indexI].positions[i][1]]
      [tresisesI[indexI].positions[i][2]] = true;
    }

  }
}
// vistar stöðu allra kubba í þrívíða boolean fylkinu
function saveAllPositions(){
    for (var i = 0; i < tresisesL.length; i++) {
      for (var j = 0; j < tresisesL[i].positions.length; j++) {
        if (!tresisesL[i].erased[j]) {
          takenPositions
          [tresisesL[i].positions[j][0]]
          [tresisesL[i].positions[j][1]]
          [tresisesL[i].positions[j][2]] = true;
        }
      }
    }
    for (var i = 0; i < tresisesI.length; i++) {
      for (var j = 0; j < tresisesI[i].positions.length; j++) {
        if (!tresisesI[i].erased[j]) {
          takenPositions
          [tresisesI[i].positions[j][0]]
          [tresisesI[i].positions[j][1]]
          [tresisesI[i].positions[j][2]] = true;
        }
      }
    }
}
// skoðar hvort fyllt hafi verið í röð og gefur stig
function checkIfPoint(){
  var point;
  for (var i = 1; i < takenPositions[0].length; i++) {
    point = true;
    for (var j = 0; j < takenPositions.length; j++) {
      for (var k = 0; k < takenPositions.length; k++) {
        if (!takenPositions[j][i][k]) {
          point = false;
          break;
        }
      }
    }
    if (point) {
      console.log("stig í línu:")
      console.log(i);
      eraseRow(i);
      updatePoints();
    }
  }
}
//hreinsar röð
function eraseRow(numRow){
  for (var i = 0; i < tresisesL.length; i++) {
    for (var j = 0; j < tresisesL[i].positions.length; j++) {

      //eyða kubb ef hann er í röðinni
      if (!tresisesL[i].erased[j] && tresisesL[i].positions[j][1] === numRow) {
        tresisesL[i].erased[j] = true;
      }
      //annars ef kubbur er fyrir ofan röðina sem eyddist þá fer hann niður um einn;
      else if (!tresisesL[i].erased[j] && tresisesL[i].positions[j][1] > numRow) {
        tresisesL[i].positions[j][1] -= 1;
      }
    }
  }
  for (var i = 0; i < tresisesI.length; i++) {
    for (var j = 0; j < tresisesI[i].positions.length; j++) {

      //eyða kubb ef hann er í röðinni
      if (!tresisesI[i].erased[j] && tresisesI[i].positions[j][1] === numRow) {
        tresisesI[i].erased[j] = true;
      }
      //annars ef kubbur er fyrir ofan röðina sem eyddist þá fer hann niður um einn;
      else if (!tresisesI[i].erased[j] && tresisesI[i].positions[j][1] > numRow) {
        tresisesI[i].positions[j][1] -= 1;
      }
    }
  }
  eraseTable();
  saveAllPositions();
}

// hreinsar þrívíða booleanfylkið sem heldur utan um stöðu kubbana
function eraseTable(){
  for (var i = 0; i < BOX_WIDHT; i++) {
    takenPositions[i] = new Array();
    for (var j = 1; j < BOX_HEIGHT+1; j++) {
      takenPositions[i][j] = new Array();
      for (var l = 0; l < BOX_LENGTH; l++) {
        takenPositions[i][j][l] = false;
      }
    }
  }
}


///////////////////////////////////////////////////////////////

// bætir við stigi og skrifar það inn í HTML
function updatePoints(){
  GamePoints++;
  pointsContainer.innerHTML = GamePoints;
}
//Býr til nýjan kubb, annað hvort I eða L
function makeNewCube(){
    if (isGameRunning) {

      checkIfPoint();
      var rand = Math.floor(Math.random() * 2); // annaðhvort I eða L (1,2)
      if (rand === 1) {
        typeOfCubePlaying = 1;
        indexL++;
        var newTri = new TriL();
        for (var i = 0; i < newTri.positions.length; i++) {
          if (
            takenPositions
            [newTri.positions[i][0]]
            [newTri.positions[i][1]]
            [newTri.positions[i][2]] === true
          ) {
            gameOver();
          }
        }
        tresisesL[indexL] = newTri;
        numCubesL++;
        if(numCubesL === 1){
          tick();
        }
      } else {
        typeOfCubePlaying = 0;
        indexI++;
        var newTri = new TriI();
        for (var i = 0; i < newTri.positions.length; i++) {
          if (
            takenPositions
            [newTri.positions[i][0]]
            [newTri.positions[i][1]]
            [newTri.positions[i][2]] === true
          ) {
            gameOver();
          }
        }
        tresisesI[indexI] = newTri;
        numCubesI++;
        if(numCubesI === 1){
          tick();
        }
      }

    }
}
// Byrjar leik
function startGame(){
  numCubesI = 0;
  numCubesL = 0;
  statusCointainer.innerHTML = ""
  tresisesI = [];
  tresisesL = [];
  indexI = -1;
  indexL = -1;
  clearTimeout(tck);
  eraseTable();
  if (!isGameRunning) {
    isGameRunning = true;
    makeNewCube();
  }
}
// Stoppar leik og skrifar það í html
function gameOver(){
  clearTimeout(tck);
  isGameRunning = false;
  statusCointainer.innerHTML = "Leik lokið. Ýttu á Enter til þess að hefja leik"
}
// renderar alla kubba
function renderCubes(){
  for (var i = 0; i < numCubesL; i++) {
    tresisesL[i].render();
    }
  for (var i = 0; i < numCubesI; i++) {
    tresisesI[i].render();
    }
}
// kallar á sig á sekúndufresti og lætur kubb falla niður um einn reit
function tick(){
  clearTimeout(tck);
  if (typeOfCubePlaying === 1) {
    if(tresisesL[indexL].positions[1][1]>0){
      tresisesL[indexL].positions[1][1] -= 1
      tresisesL[indexL].updatePos();
      if(!checkIfallowed()){
        tresisesL[indexL].positions[1][1] += 1
      }
    }
    tresisesL[indexL].updatePos();
    tresisesL[indexL].checkIfBottom();
    //setTimeout(tresisesL[indexL].checkIfBottom,700)
  } else {
    if(tresisesI[indexI].positions[1][1]>0){
      tresisesI[indexI].positions[1][1] -= 1
      tresisesI[indexI].updatePos();
      if(!checkIfallowed()){
        tresisesI[indexI].positions[1][1] += 1
      }
    }
    tresisesI[indexI].updatePos();
    tresisesI[indexI].checkIfBottom();
    //setTimeout(tresisesI[indexI].checkIfBottom,700)
  }
  tck = setTimeout(tick,1000);
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var mv = lookAt( vec3(0.0, 0, zView), vec3(0.0, 0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult(mv, translate(2.5,-10,2.5));
    mv = mult( mv, rotateX(-moveY) );
    mv = mult( mv, rotateY(-moveX) );
    mv = mult(mv, translate(-2.5,0,-2.5));
    modelViewMatrix = mv;

    gl.uniform4fv( colorLoc, vec4(0.0, 0.0, 0.0, 1.0) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(modelViewMatrix));
    gl.drawArrays( gl.LINES, 0, NumCube );
    renderCubes();
    requestAnimFrame( render );
}

// I kubba klasi
class TriI {

  positions = [[3,19,3],[3,19,3],[3,19,3]];
  angles = [0,0,0]
  color = colors[Math.floor(Math.random() * 5)];
  erased = [false,false,false]; // er búið að hreinsa kubb?

  render(){
    for (var k = 0; k < 3; k++) {
      if(!this.erased[k]){
        var instance = modelViewMatrix;
        instance = mult(instance, translate(this.positions[k][0] + 0.5 ,this.positions[k][1]-0.5,this.positions[k][2] + 0.5));
        gl.uniform4fv( colorLoc, this.color);
        gl.uniformMatrix4fv(mvLoc, false, flatten(instance));
        gl.drawArrays( gl.TRIANGLES, NumCube, NumVertices );
        //Teikna útlínur
        gl.uniform4fv( colorLoc, vec4(0.0, 0.0, 0.0, 1.0));
        gl.drawArrays( gl.LINES, NumCube+NumVertices, NumOutlines );
      }
    }
  }

  moveX(x){
    if (x > 0) {
      if(this.positions[1][0] > 0){
        this.positions[1][0] -= x
        this.updatePos();
        if(!checkIfallowed()){
          this.positions[1][0] += x
        }
      }
    } else {
      if(this.positions[1][0] < 5){
        this.positions[1][0] -= x
        this.updatePos();
        if(!checkIfallowed()){
          this.positions[1][0] += x
        }
      }

    }
    this.updatePos();
    this.checkIfBottom();
  }
  moveY(){
    if(this.positions[1][1]>0){
      this.positions[1][1] -= 1
      this.updatePos();
      if(!checkIfallowed()){
        this.positions[1][1] += 1
      }
    }
    this.updatePos();
    this.checkIfBottom();
  }
  moveZ(z){
    if (z > 0) {
      if(this.positions[1][2] < 5){
        this.positions[1][2] += z;
        this.updatePos();
        if(!checkIfallowed()){
          this.positions[1][2] -= z
        }
      }
    } else {
      if(this.positions[1][2] > 0){
        this.positions[1][2] += z;
        this.updatePos();
        if(!checkIfallowed()){
          this.positions[1][2] -= z
        }
      }
    }
    this.updatePos();
    this.checkIfBottom();
  }
  angleX(x){
    if (x > 0) {
      if(this.angles[0] === 270 ){
        this.angles[0] = 0;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[0] = 270;
        }
      }
      else {
        this.angles[0] += x;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[0] -= x;
        }
      }
    } else {
      if(this.angles[0] === 0 ){
        this.angles[0] = 270;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[0] = 0;
        }
      }
      else {
        this.angles[0] += x;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[0] -= x;
        }
      }
    }
    this.updatePos();
    this.checkIfBottom();
  }
  angleY(y){

  }

  angleZ(z){
    if (z > 0) {
      if(this.angles[2] === 270 ) {
        this.angles[2] = 0;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[2] = 270
        }
      }
      else {
        this.angles[2] += z;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[2] -= z
        }
      }
    } else {
      if(this.angles[2] === 0 ) {
        this.angles[2] = 270;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[2] = 0
        }
      }
      else {
        this.angles[2] += z;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[2] -= z
        }
      }
    }
    this.updatePos();
    this.checkIfBottom();
  }
  updatePos(){
    var temp = this.positions[1];
    for (var i = 0; i < this.positions.length; i++) {
      this.positions[i] = [0,0,0];
      for (var j = 0; j < 3 ; j++) {
        this.positions[i][j] = temp[j];
      }
    }

    var xAngle = this.angles[0];
    var zAngle = this.angles[2];

    // y+-
    if((xAngle === 180 || xAngle === 0) &&  (zAngle === 180 || zAngle === 0)){
      this.positions[0][1] +=1;
      this.positions[2][1] -=1;
    }
    // x+-
    else if(zAngle === 270 || zAngle === 90){
      this.positions[0][0] +=1;
      this.positions[2][0] -=1;
    }
    // z+-
    else if(zAngle == 180 || zAngle === 0){
      this.positions[0][2] +=1;
      this.positions[2][2] -=1;
    }
  }
  checkIfBottom(){
    var minY = Math.min(this.positions[0][1],this.positions[1][1],this.positions[2][1]);
    if(minY === 1){
      savepositions();
      makeNewCube();
    } else {
      for (var i = 0; i < this.positions.length; i++) {
        if(takenPositions[this.positions[i][0]][this.positions[i][1]-1][this.positions[i][2]] === true){
          savepositions();
          makeNewCube();
          break;
        }
      }
    }

  }
}


// L kubba klasi
class TriL {

  positions = [[3,19,3],[3,19,3],[3,19,3]];
  angles = [0,0,0]
  color = colors[Math.floor(Math.random() * 5)];
  erased = [false,false,false]

  render(){
    for (var k = 0; k < 3; k++) {
      if(!this.erased[k]){
        var instance = modelViewMatrix;
        instance = mult(instance, translate(this.positions[k][0] + 0.5 ,this.positions[k][1]-0.5,this.positions[k][2] + 0.5));
        gl.uniform4fv( colorLoc, this.color);
        gl.uniformMatrix4fv(mvLoc, false, flatten(instance));
        gl.drawArrays( gl.TRIANGLES, NumCube, NumVertices );
        //Teikna útlínur
        gl.uniform4fv( colorLoc, vec4(0.0, 0.0, 0.0, 1.0));
        gl.drawArrays( gl.LINES, NumCube+NumVertices, NumOutlines );
      }
    }
  }

  moveX(x){
    if (x > 0) {
      if(this.positions[1][0] > 0){
        this.positions[1][0] -= x
        this.updatePos();
        if(!checkIfallowed()){
          this.positions[1][0] += x
        }
      }
    } else {
      if(this.positions[1][0] < 5){
        this.positions[1][0] -= x
        this.updatePos();
        if(!checkIfallowed()){
          this.positions[1][0] += x
        }
      }

    }
    this.updatePos();
    this.checkIfBottom();
  }
  moveY(){
    if(this.positions[1][1]>0){
      this.positions[1][1] -= 1
      this.updatePos();
      if(!checkIfallowed()){
        this.positions[1][1] += 1
      }
    }
    this.updatePos();
    this.checkIfBottom();
  }
  moveZ(z){
    if (z > 0) {
      if(this.positions[1][2] < 5){
        this.positions[1][2] += z;
        this.updatePos();
        if(!checkIfallowed()){
          this.positions[1][2] -= z
        }
      }
    } else {
      if(this.positions[1][2] > 0){
        this.positions[1][2] += z;
        this.updatePos();
        if(!checkIfallowed()){
          this.positions[1][2] -= z
        }
      }
    }
    this.updatePos();
    this.checkIfBottom();
  }
  angleX(x){
    if (x > 0) {
      if(this.angles[0] === 270 ){
        this.angles[0] = 0;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[0] = 270;
        }
      }
      else {
        this.angles[0] += x;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[0] -= x;
        }
      }
    } else {
      if(this.angles[0] === 0 ){
        this.angles[0] = 270;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[0] = 0;
        }
      }
      else {
        this.angles[0] += x;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[0] -= x;
        }
      }
    }
    this.updatePos();
    this.checkIfBottom();
  }
  angleY(y){
    if (y > 0) {
      if(this.angles[1] === 270 ) {
        this.angles[1] = 0;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[1] = 270
        }
      }
      else {
        this.angles[1] += y;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[1] -= y;
        }
      }
    } else {
      if(this.angles[1] === 0 ) {
        this.angles[1] = 270;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[1] = 0
        }
      }
      else {
        this.angles[1] += y;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[1] -= y
        }
      }
    }
    this.updatePos();
    this.checkIfBottom();

  }

  angleZ(z){
    if (z > 0) {
      if(this.angles[2] === 270 ) {
        this.angles[2] = 0;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[2] = 270
        }
      }
      else {
        this.angles[2] += z;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[2] -= z
        }
      }
    } else {
      if(this.angles[2] === 0 ) {
        this.angles[2] = 270;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[2] = 0
        }
      }
      else {
        this.angles[2] += z;
        this.updatePos();
        if(!checkIfallowed()){
          this.angles[2] -= z
        }
      }
    }
    this.updatePos();
    this.checkIfBottom();
  }
  updatePos(){
    var temp = this.positions[1];
    for (var i = 0; i < this.positions.length; i++) {
      this.positions[i] = [0,0,0];
      for (var j = 0; j < 3 ; j++) {
        this.positions[i][j] = temp[j];
      }
    }

    var xAngle = this.angles[0];
    var yAngle = this.angles[1];
    var zAngle = this.angles[2];

    var vecY =  rotZ(rotY(rotX([0,1,0],xAngle),yAngle),zAngle);
    // console.log(vecY);
    var vecZ =  rotZ(rotY(rotX([0,0,1],xAngle),yAngle),zAngle);
    //console.log(vecZ);
    for (var i = 0; i < this.positions[0].length; i++) {
      this.positions[0][i] += vecY[i];
    }
    for (var i = 0; i < this.positions[2].length; i++) {
      this.positions[2][i] += vecZ[i];
    }
  }
  checkIfBottom(){
    var minY = Math.min(this.positions[0][1],this.positions[1][1],this.positions[2][1]);
    if(minY === 1){
      savepositions();
      makeNewCube();
    } else {
      for (var i = 0; i < this.positions.length; i++) {
        if(takenPositions[this.positions[i][0]][this.positions[i][1]-1][this.positions[i][2]] === true){
          savepositions();
          makeNewCube();
          break;
        }
      }
    }
  }
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    makeTetrisBox();
    makeCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "fColor" );
    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    // Setjum ofanvarpsfylki hér í upphafi
    var proj = perspective( 90.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    modelViewMatrix = mat4();
    instanceMatrix = mat4();
    gl.uniformMatrix4fv(mvLoc, false, flatten(modelViewMatrix) );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.clientX;
        origY = e.clientY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {

            moveX = (e.clientX - origX);
            moveY = (e.clientY - origY);

        }
    } );

    pointsContainer = document.getElementById("points");
    statusCointainer = document.getElementById("status");

    window.addEventListener("mousewheel", function(e){ //atburðarfall fyrir músarhjól
        if( e.wheelDelta > 0.0 ) {
            zView += 0.1;
        } else {
            zView -= 0.1;
        }
    }  );

     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
           //enter
            case 13:
              if (!isGameRunning) {
                startGame();
              }
              break;
            case 37: // left arrow
              if (typeOfCubePlaying === 1) {
                tresisesL[indexL].moveX(1);
              } else {
                tresisesI[indexI].moveX(1)
              }
              break;
            case 40: // down arrow
              moveZ(1);
              break;
            case 39: // right arrow
              if (typeOfCubePlaying === 1) {
                tresisesL[indexL].moveX(-1);
              } else {
                tresisesI[indexI].moveX(-1)
              }
              break;
            case 38: // up arrow
              moveZ(-1);
              break;
            case 32: //spacebar
              if (typeOfCubePlaying === 1) {
                tresisesL[indexL].moveY();
              } else {
                tresisesI[indexI].moveY()
              }
              break;
            case 65: //a
              angleX(90);
              break;
            case 90: //z
              angleX(-90);
              break;
            case 83: //s
              angleY(90);
              break;
            case 88: //x
              angleY(-90);
              break;
            case 68: //d
              angleZ(90);
              break;
            case 67: //c
              angleZ(-90);
              break;
         }
     } );
    render();
}
