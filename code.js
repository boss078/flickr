/* eslint-disable jquery/no-hide */
/* eslint-disable jquery/no-show */
const objects = [];
$(() => {
  fetch('https://www.flickr.com/services/rest/?method=flickr.collections.getTree&api_key=3fd6b6c713e17868f8c64d499628ace2&user_id=48600090482%40N01&format=json&nojsoncallback=1&api_sig=932b73bc6f48e093cdd228f4b3ce83b8')
    .then((response) => response.json())
    .then((data) => {
      const collections = data.collections.collection;
      for (let i = 0; i < collections.length; i += 1) {
        for (let j = 0; j < collections[i].set.length; j += 1) {
          objects.push(collections[i].set[j]);
        }
      }
      for (let currPageIndex = 0; currPageIndex < Math.ceil(objects.length / 7);
        currPageIndex += 1) {
        const currPage = $('<div></div>')
          .attr('id', `page${currPageIndex}`);
        for (let i = currPageIndex * 7; i < (currPageIndex + 1) * 7 && i < objects.length; i += 1) {
          const objectWrapper = $('<div></div>')
            .addClass('photoset__wrapper');
          const objectTitle = $('<div></div>')
            .addClass('photoset__title')
            .text(objects[i].title);
          const objectDescription = $('<div></div>')
            .addClass('photoset__description')
            .text(objects[i].description);
          objectWrapper.append(objectTitle, objectDescription);
          $(currPage).append(objectWrapper);
        }
        currPage.hide();
        $('#loaded_data_ptr').append(currPage);
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
