/* eslint-disable jquery/no-hide */
/* eslint-disable jquery/no-show */
const objects = [];
let photosetsData;
$(() => {
  fetch('https://www.flickr.com/services/rest/?method=flickr.collections.getTree&api_key=c0c650afee07cfbebeb590e0d5208286&user_id=48600090482%40N01&format=json&nojsoncallback=1&api_sig=e3da3fb9fc8ac3392ea84d8de190b2b5')
    .then((response) => response.json())
    .then((data) => {
      const collections = data.collections.collection;
      for (let i = 0; i < collections.length; i += 1) {
        for (let j = 0; j < collections[i].set.length; j += 1) {
          objects.push(collections[i].set[j]);
        }
      }
      photosetsData = new Array(objects.length).fill(0);
      for (let currPageIndex = 0; currPageIndex < Math.ceil(objects.length / 7);
        currPageIndex += 1) {
        const currPage = $('<div></div>')
          .attr('id', `page${currPageIndex}`);
        for (let i = currPageIndex * 7; i < (currPageIndex + 1) * 7 && i < objects.length; i += 1) {
          const objectWrapper = $('<div></div>')
            .addClass('photoset__wrapper')
            .attr('id', `photoset${i}`);
          const objectHeader = $('<div></div>')
            .addClass('photoset__header');
          const objectTitle = $('<div></div>')
            .addClass('photoset__title')
            .text(objects[i].title);
          const objectMore = $('<button>More</button>')
            .addClass('btn btn-info')
            .attr('id', 'more-button')
            .attr('type', 'button')
            .attr('onclick', `showPhotosetPhotos(${i})`);
          objectHeader.append(objectTitle, objectMore);
          const objectDescription = $('<div></div>')
            .addClass('photoset__description')
            .text(objects[i].description);
          objectWrapper.append(objectHeader, objectDescription);
          $(currPage).append(objectWrapper);
        }
        currPage.hide();
        $('#loaded_data').append(currPage);
        $('.pagination').append($(`<li class="page-item"><a class="page-link" href="javascript:changePage(${currPageIndex});">${currPageIndex + 1}</a></li>`));
      }
      $('.page-item:first').addClass('active');
      $('#page0').show();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});

// eslint-disable-next-line no-unused-vars
function changePage(targetPage) {
  $(`#page${$('.page-item.active').text() - 1}`).hide();
  $('.page-item.active').removeClass('active');
  $(`#page${targetPage}`).show();
  $('.page-item').each((index, element) => {
    if (element.innerText === `${targetPage + 1}`) {
      element.classList.add('active');
    }
  });
}

// eslint-disable-next-line no-unused-vars
function showPhotosetPhotos(photosetIndex) {
  if (photosetsData[photosetIndex] === 0) {
    fetch(`https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=c0c650afee07cfbebeb590e0d5208286&photoset_id=${objects[photosetIndex].id}&format=json&nojsoncallback=1&api_sig=ebf4eec29d25d7533922890e81f05877`)
      .then((response) => response.json())
      .then((data) => {
        photosetsData[photosetIndex] = data.photoset.photo;
        const photosetPhotos = $('<div></div>')
          .addClass('visible')
          .attr('id', `photoset${photosetIndex}-photos`);
        photosetsData[photosetIndex].forEach((element) => {
          const photoWrapper = $('<div></div>')
            .addClass('photo-object__wrapper');
          const photoTitle = $('<div></div>')
            .addClass('photo-object__title')
            .text(element.title);
          photoWrapper.append(photoTitle);
          photosetPhotos.append(photoWrapper);
        });
        $(`#photoset${photosetIndex}`).append(photosetPhotos);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  } else {
    const photos = $(`#photoset${photosetIndex}-photos`);
    if (photos.hasClass('visible')) {
      photos.hide();
      photos.removeClass('visible');
    } else {
      photos.show();
      photos.addClass('visible');
    }
  }
}
