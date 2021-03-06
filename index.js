/* eslint-disable jquery/no-hide */
/* eslint-disable jquery/no-show */
const objects = [];
let photosetsData;
let carouselData;
let sortMode = 'default';
const fullDomObjects = [];
let domObjects = [];
$(() => {
  fetch('https://www.flickr.com/services/rest/?method=flickr.collections.getTree&api_key=f6146b5aea320305af01030c6fc04c59&user_id=48600090482%40N01&format=json&nojsoncallback=1')
    .then((response) => response.json())
    .then((data) => {
      const collections = data.collections.collection;
      for (let i = 0; i < collections.length; i += 1) {
        for (let j = 0; j < collections[i].set.length; j += 1) {
          objects.push(collections[i].set[j]);
        }
      }
      photosetsData = new Array(objects.length).fill(0);
      carouselData = new Array(objects.length).fill(0);
      for (let currPageIndex = 0; currPageIndex < Math.ceil(objects.length / 7);
        currPageIndex += 1) {
        const currPage = $('<div></div>')
          .attr('id', `page${currPageIndex}`)
          .addClass('pagination-page');
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
            .addClass('btn btn-info mb-1')
            .attr('id', 'more-button')
            .attr('type', 'button')
            .attr('onclick', `showPhotosetPhotos(${i})`);
          objectHeader.append(objectTitle, objectMore);
          const objectDescription = $('<div></div>')
            .addClass('photoset__description')
            .text(objects[i].description);
          objectWrapper.append(objectHeader, objectDescription);
          domObjects.push(objectWrapper);
          fullDomObjects.push(objectWrapper);
          $(currPage).append(objectWrapper);
        }
        currPage.hide();
        $('#loaded_data').append(currPage);
        $('.pagination').append($(`<li class="page-item"><a class="page-link" href="javascript:changePage(${currPageIndex});">${currPageIndex + 1}</a></li>`));
      }
      $('.page-item:first').addClass('active');
      $('#page0').show();
    }, (error) => {
      const errorWrapper = $('<div></div')
        .addClass('error__wrapper');
      const errorMessage = $('<div></div')
        .addClass('error__message')
        .text(`Failed to load data, because ${error.name} happend. Error message: ${error.message}`);
      errorWrapper.append(errorMessage);
      $('#loaded_data').append(errorWrapper);
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
  if ($('.carousel-inner').length !== 0) {
    $('.carousel-inner').detach();
  }
  if (photosetsData[photosetIndex] === 0) {
    fetch(`https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=f6146b5aea320305af01030c6fc04c59&photoset_id=${objects[photosetIndex].id}&user_id=48600090482%40N01&format=json&nojsoncallback=1`)
      .then((response) => response.json())
      .then((data) => {
        $(`#photoset${photosetIndex}`).find($('.error__wrapper')).remove();
        photosetsData[photosetIndex] = data.photoset.photo;
        const photosetPhotos = $('<div></div>')
          .addClass('visible')
          .attr('id', `photoset${photosetIndex}-photos`);
        const carouselModalButton = $('<input/>')
          .addClass('btn btn-primary')
          .attr({
            type: 'button',
            value: 'View Photos',
            'data-toggle': 'modal',
            'data-target': '#carousel-modal',
            onclick: `changeCarousel(${photosetIndex});`,
          })
          .text('Open modal');
        photosetPhotos.append(carouselModalButton);
        const carouselPhotosWrapper = $('<div></div>')
          .addClass('carousel-inner');
        photosetsData[photosetIndex].forEach((element, index) => {
          const carouselPhotoWrapper = $('<div></div>')
            .addClass('carousel-item');
          if (index === 0) {
            carouselPhotoWrapper.addClass('active');
          }
          const carouselPhoto = $('<img>')
            .attr({
              src: `https://farm${element.farm}.staticflickr.com/${element.server}/${element.id}_${element.secret}.jpg`,
              alt: `${element.title}`,
              height: 'auto',
              width: '100%',
              'max-width': '766',
            });
          const photoTitle = $(`<h3>${element.title}</h3>`);
          const carouselCaption = $('<div></div')
            .addClass('carousel-caption');
          carouselCaption.append(photoTitle);
          carouselPhotoWrapper.append(carouselPhoto, carouselCaption);
          carouselPhotosWrapper.append(carouselPhotoWrapper);
          const photoLink = $('<div></div>')
            .addClass('photoset__photo-title')
            .text(element.title);
          photosetPhotos.append(photoLink);
        });
        carouselData[photosetIndex] = carouselPhotosWrapper;
        $(`#photoset${photosetIndex}`).append(photosetPhotos);
      }, (error) => {
        if ($(`#photoset${photosetIndex}`).find($('.error__wrapper')).length === 0) {
          const errorWrapper = $('<div></div')
            .addClass('error__wrapper');
          const errorMessage = $('<div></div')
            .addClass('error__message')
            .text(`Faild to load more info, because ${error.name} happend. Error message: ${error.message}`);
          errorWrapper.append(errorMessage);
          $(`#photoset${photosetIndex}`).append(errorWrapper);
        }
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

// eslint-disable-next-line no-unused-vars
function changeCarousel(carouselIndex) {
  $('.carousel-inner').detach();
  $('#carousel-photo').prepend(carouselData[carouselIndex]);
}

function changeOrder(order) {
  $('.pagination-page, .page-item').detach();
  const domObjectsCopy = [...domObjects];
  switch (order) {
    default:
    case 'default':
      sortMode = 'default';
      $('.dropdown-toggle').text('Default order');
      break;
    case 'ascending':
      sortMode = 'ascending';
      $('.dropdown-toggle').text('Alphabetic ascending');
      domObjectsCopy.sort((a, b) => {
        if (a[0].firstChild.firstChild.innerText.toLowerCase()
          < b[0].firstChild.firstChild.innerText.toLowerCase()) {
          return -1;
        }
        if (a[0].firstChild.firstChild.innerText.toLowerCase()
          > b[0].firstChild.firstChild.innerText.toLowerCase()) {
          return 1;
        }
        return 0;
      });
      break;
    case 'descending':
      sortMode = 'descending';
      $('.dropdown-toggle').text('Alphabetic descending');
      domObjectsCopy.sort((a, b) => {
        if (a[0].firstChild.firstChild.innerText.toLowerCase()
          < b[0].firstChild.firstChild.innerText.toLowerCase()) {
          return 1;
        }
        if (a[0].firstChild.firstChild.innerText.toLowerCase()
          > b[0].firstChild.firstChild.innerText.toLowerCase()) {
          return -1;
        }
        return 0;
      });
      break;
  }
  for (let currPageIndex = 0; currPageIndex < Math.ceil(domObjectsCopy.length / 7);
    currPageIndex += 1) {
    const currPage = $('<div></div>')
      .attr('id', `page${currPageIndex}`)
      .addClass('pagination-page');
    for (let i = currPageIndex * 7; i < (currPageIndex + 1) * 7
      && i < domObjectsCopy.length; i += 1) {
      $(currPage).append(domObjectsCopy[i]);
    }
    currPage.hide();
    $('#loaded_data').append(currPage);
    $('.pagination').append($(`<li class="page-item"><a class="page-link" href="javascript:changePage(${currPageIndex});">${currPageIndex + 1}</a></li>`));
  }
  $('.page-item:first').addClass('active');
  $('#page0').show();
}

// eslint-disable-next-line no-unused-vars
function applySearch() {
  const searchWord = $('#search-field')[0].value.toLowerCase();
  domObjects = [...fullDomObjects];
  if (searchWord !== '') {
    for (let i = 0; i < domObjects.length; i += 1) {
      if (domObjects[i][0].firstChild.firstChild.innerText.toLowerCase()
        .search(searchWord) === -1) {
        domObjects.splice(i, 1);
        i -= 1;
      }
    }
  }
  changeOrder(sortMode);
}
