//Demo of image replacer chrome extension - from Dan Shiffman's Clarifai API example
var imgURLS = ["http://i2.cdn.turner.com/cnnnext/dam/assets/151207065545-01-obama-speech-1207-overlay-tease.jpg",
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
"http://i.kinja-img.com/gawker-media/image/upload/s--FJ4m_ViD--/18j05qgz6tfxjjpg.jpg",
"http://thumbs.dreamstime.com/z/diet-woman-eating-vegetable-salad-26750865.jpg"];

// //don't need this array of image elements might now, might need it later
// var imgElts = [];

function setup() {

  noCanvas();

  for (var i = 0; i < imgURLS.length; i++){
    var imgURL = imgURLS[i];
    var div = createDiv(''); //make a div to be a container for the image
    var imgElt = createImg(imgURL);
    imgElt.parent(div); //put the image inside the container
    //imgElts.push(imgElt);
    imageToText(imgElt, imgURL, div); //passing it to a holder function called imageToText
  }


  function imageToText(imgElt, imgURL, div) {
    imgElt.mousePressed(queryClarifai); //when you click the image ELEMENT, then query the Clarifai API

    function queryClarifai() {
      $.ajax({
      url: 'https://api.clarifai.com/v1/tag/',
      type: 'GET',
      beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', 'Bearer 2IiduH1pWlJeCBl53NKwfkkkRkxXu6');
     },
     data: {
         url: imgURL //here's where you access the image URL to make the query
     },

      success: function (response) {  //run this function if you get the data back successfully

        imgElt.hide(); //hide the image element
        // console.log(response); //print raw response, including confidence scores for each tag

        //Get all the image tags from clarifai
        var tagsArray = response.results[0].result.tag.classes;
        console.log(tagsArray);
     

        // //POS TAGGING WITH RITA
        // for (var i = 0; i<tagsArray.length; i++) {
        //   var pos = RiTa.getPosTags(tagsArray[i]);
        //   console.log(tagsArray[i],pos);
        // }        

        var posTagging = {}; //empty object to hold parts of speech

        //For every tag from clarifai
        //Do the part of speech tagging using NLP Compromise - create an object that holds POS as the key, with all of the tags
        for (var i = 0; i<tagsArray.length; i++){

          var partSpeech = nlp.pos(tagsArray[i]).tags().toString(); //get part of speech, convert from array to string
          console.log(tagsArray[i], partSpeech);

          if (!posTagging[partSpeech]) { //if the part of speech is not yet a key in the object posTagging, set it as a key
            posTagging[partSpeech] = [];
          } 

          posTagging[partSpeech].push(tagsArray[i]); //add the tag to the corresponding part of speech array inside the object

        }

        console.log(posTagging);
        

        var choice = floor(random(0, tagsArray.length)); //choose a random number to pick a tag from the list

        //suggestion for next timecontext-free grammar; build a sentence from part 1, part 2, part 3, etc.
        var description = createP("This is a " + tagsArray[0] + ", an image of " + tagsArray[choice]);
        description.parent(div);
        div.size(imgElt.width, imgElt.height);
        div.style('background-color', '#e6e6e6');
       



    },

    error: function (err) { 
      console.log(err);
    },
  });
}
  }



  
}
