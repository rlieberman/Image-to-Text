//ISSUES
//part of speech tagging is not good with Rita, need to switch over to NLP compromise
//when object POS tagging is a global variable, its picking random words that don't go with that image
//need to figure out variable scope for POS tagging
//also lots of messy functions and scoping - how can i clean up the code?
//also do i want to query wordnik for hypernyms? not sure about this



//Web demo of image replacer chrome extension - from Dan Shiffman's Clarifai API example
var clientID = 'eWxNW-xStnWuGcwpRWd-hD17g1GEGCDonqxQ8iAk';
var clientSecret = 'ckGbfL_gcWWtdEV8x9B_g0Pp8ptcX5K6wshY_PUK';
var baseUrl = 'https://api-alpha.clarifai.com/v1/';

var accessToken; //for programmatically generating a new Clarifai access token

//test image urls
var imgURLS = [
"http://image.shutterstock.com/display_pic_with_logo/528361/254446402/stock-photo-drums-conceptual-image-picture-of-drums-and-drumsticks-lying-on-snare-drum-retro-vintage-254446402.jpg",
"https://www.priv.gc.ca/information/research-recherche/2013/images/drone1.jpg",
"http://static01.nyt.com/images/2015/12/13/nyregion/13MUSLIMYOUTH1/13MUSLIMYOUTH1-largeHorizontal375.jpg",
"http://static01.nyt.com/images/2015/12/14/nytnow/14nytnow-climate02/14nytnow-climate02-master675.jpg",
"http://static01.nyt.com/images/2015/12/14/business/14RATES-1/14RATES-1-master675.jpg",
"http://i2.nyt.com/images/2015/12/14/sports/14convo-gronksub/14convo-gronksub-superJumbo.jpg",
"http://static01.nyt.com/images/2015/12/16/us/transop-photos-slide-GAP9/transop-photos-slide-GAP9-articleLarge.jpg",
"http://i2.cdn.turner.com/cnnnext/dam/assets/151207065545-01-obama-speech-1207-overlay-tease.jpg",
"http://www.history.com/s3static/video-thumbnails/AETN-History_VMS/21/115/History_Engineering_the_Taj_Mahal_42712_reSF_HD_still_624x352.jpg",
"https://vice-images.vice.com/images/articles/crops/2015/07/01/donald-trump-is-losing-his-insane-pr-war-against-mexico-1435778037-crop_mobile.jpg?resize=*:*&output-quality=75",
"http://i.space.com/images/i/000/019/699/i02/milky-way-mount-shasta.jpg?1342794653", 
"https://jaymccarroll.files.wordpress.com/2012/12/ugly-sweater.jpg", 
"http://si.wsj.net/public/resources/images/BN-LO975_csmog1_G_20151207074634.jpg", 
"http://www.gannett-cdn.com/-mm-/4ea012fa6b4321eeecf3072a09c5663a23357c74/c=0-0-2256-1698&r=x404&c=534x401/local/-/media/Reno/2014/08/22/fergusongetty1.jpg", 
"http://images.mentalfloss.com/sites/default/files/styles/article_640x430/public/pearl-harbor-attack.png", 
"http://s.newsweek.com/sites/www.newsweek.com/files/styles/headline/public/2014/12/20/rtr4favg.jpg", 
"http://images.starpulse.com/news/bloggers/1279398/blog_images/kate-upton-3.jpg", 
"http://www.abc.net.au/news/image/4695540-3x2-940x627.jpg",
"http://static01.nyt.com/images/2015/12/07/us/08SCOTUSGUNS-hp/08SCOTUSGUNS-hp-largeHorizontal375.jpg",
"https://scontent-lga3-1.xx.fbcdn.net/hphotos-xpf1/t31.0-8/12240837_10205777745307754_2044420560543144288_o.jpg",
"http://www.dumblittleman.com/wp-content/uploads/2014/05/Healthy-Eating.jpg",
"http://i.kinja-img.com/gawker-media/image/upload/s--FJ4m_ViD--/18j05qgz6tfxjjpg.jpg"];


function setup() {

  noCanvas();

  //use this ajax request to programmatically generate a new access token
  var data = {
    'grant_type': 'client_credentials',
    'client_id': clientID,
    'client_secret': clientSecret
  }

  $.ajax({
    'type': 'POST',
    'url': baseUrl + 'token',
    'data': data,
    success: function (response) { 
      console.log(response);
      accessToken = response;
      gotToken(); //call the gotToken function when you get back a token
    },
    error: function (err) { 
      console.log(err);
    }
  });



  function gotToken() {

    for (var i = 0; i < imgURLS.length; i++){
      var imgURL = imgURLS[i];
      var div = createDiv(''); //make an empty div to be a container for the image
      var imgElt = createImg(imgURL);
      imgElt.parent(div); //put the image inside the container

      imageToText(imgElt, imgURL, div); //passing it to a holder function called imageToText
      
    }

    function imageToText(imgElt, imgURL, div) { //function to translate image to text
      queryClarifai();

      function queryClarifai() { //function to query Clarifai
      
        $.ajax({
          url: 'https://api.clarifai.com/v1/tag/',
          type: 'GET',
          beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken.access_token);
        },
        data: {
          url: imgURL //here's where you access the image URL to make the query
        },

      success: function (response) {  //run this function if you get the data back successfully
     
        //Get all the image tags from clarifai in an array
        var tagsArray = response.results[0].result.tag.classes;
        console.log(imgURL, tagsArray);

        tagPOS(tagsArray); //tag the parts of speech
        queryWordnik(); //will want to query the wordnik API to get additional words
        // createSentence(); //make a sentence

        //For every tag from clarifai --  do the part of speech tagging using Rita.JS
        //Create an object that holds POS as the key, with all of the tags
        function tagPOS(array) {

          var posTagging = {}; //set posTagging to be an empty object

          for (var i = 0; i<tagsArray.length; i++){

            var partSpeech = RiTa.getPosTags(tagsArray[i]); //get part of speech, convert from array to string
            // console.log(tagsArray[i], partSpeech);

            if (!posTagging[partSpeech]) { //if the part of speech is not yet a key in the object posTagging, set it as a key
              posTagging[partSpeech] = []; //set POS as key, create an empty array as the value
            }

            posTagging[partSpeech].push(tagsArray[i]); //add the tag as the value inside the object PosTagging
          
          }

          // console.log(posTagging); //print the object with tags and parts of speech

          function queryWordnik() {
            //pick a tag from our list of tags to query wordnik with
             var toQuery = RiTa.singularize(RiTa.randomItem(posTagging['nn']));
            // console.log(toQuery);

            var api_key = "6edaeb62f750014c3e0010253b304ea94f29df9bf10d9f350";
            var wordnikURL = "http://api.wordnik.com/v4/word.json/" + toQuery + "/relatedWords?useCanonical=true&relationshipTypes=hypernym&limitPerRelationshipType=20&api_key=" + api_key;
            // console.log(wordnikURL);
            loadJSON (wordnikURL, createSentence);

          function createSentence(data) { //Create the sentence structure from the data

            var imgDescription; //empty variable for the image description

            //step 1 get a first noun
            var firstNoun = tagsArray[0];

            //step 2 pick an adjective if there is one
            if ('jj' in posTagging) {
              var adjective = RiTa.randomItem(posTagging['jj']);
            }

            else {
              adjective = ""; //if there's no adjective, return nothing
            }

            var secondNoun = RiTa.randomItem(posTagging['nn']); //not using hypernyms for now, results are weird

            console.log(tagsArray, firstNoun, secondNoun); // for some reason it's picking nouns from the wrong one

            //step 3 get a second noun from wordnik data if there is one and construct the sentence
            if (Object.keys(data).length == 0) { // if there's no data from wordnik
              console.log("this is my second noun: " + secondNoun);
              imgDescription = createP("This is a " + RiTa.singularize(firstNoun) + ", an image of "  + adjective + " " + RiTa.pluralize(secondNoun) + ".");
             }

             else { //if you DO get back data from wordnik
              var hypernym = RiTa.randomItem(data[0].words);
              console.log("this is a hypernym: " + hypernym);
              imgDescription = createP("This is a " + RiTa.singularize(firstNoun) + ", an image of "  + adjective + " " + RiTa.pluralize(secondNoun) + ".");
             }

            imgDescription.parent(div);

                      // //when you click the div, show the image and hide the description
            div.mousePressed(function() { 

            imgElt.show(); 
            imgDescription.hide();
            div.style('background-color', 'transparent');

            });
        
            }
          }


          //Hide the image, create the grey div and add the desription
          imgElt.hide();
          console.log("image is hidden");

          div.size(imgElt.width, imgElt.height); //set the size of the div to be the same as the image
          div.style('background-color', '#e6e6e6');

        }


  

 
      },

    error: function (err) { 
      console.log(err);
    },
  });
  }
}


}

}


