var ajax = require('ajax');
var Light = require('ui/light');
var UI = require('ui');
var Vector2 = require('vector2');

// Watch info
var info;
if (Pebble.getActiveWatchInfo) {
  info = Pebble.getActiveWatchInfo();
} else {
  info = {"platform":"aplite"};
}

// UUID
var uuid = Pebble.getAccountToken();
if (uuid === '') uuid = Pebble.getWatchToken().toUpperCase();

// Global Variables
var ver = '1.2';
var base_url = 'https://www.ivlivs.it/groceries/';
var api_query = 'api.php?ver=' + ver + '&platform=' + info.platform.substr(0, 1) + '&uuid=' + uuid;
var config_page = base_url + 'login1.php?uuid=' + uuid;
var listId;  // active list id
var listIndex;  // active list number
var categoryList = {};

// Aux card
var message = new UI.Card({
  style: 'small',
  scrollable: true
});

// Details card
var details = new UI.Card({
  style: 'large'
});

// Wait card
var wait = new UI.Window();
var wait_image = new UI.Image({
  position: new Vector2(0, 0),
  size: new Vector2(144, 100),
  //image: 'images/icon_144x100.png'
  image: (info.platform == 'aplite' ? 'images/icon_144x100.png' : 'images/icon_144x100-color.png')
});
wait.add(wait_image);
var wait_text = new UI.Text({
  position: new Vector2(0, 100),
  size: new Vector2(144, 68),
  text:'Connecting to\nOurGroceries...',
  font:'GOTHIC_18_BOLD',
  color:'black',
  textOverflow:'wrap',
  textAlign:'center',
  backgroundColor:'white'
});
wait.add(wait_text);

// Display error messages
function display_message(n, error, status) {
  "use strict";
  message.title('');
  message.subtitle('');
  switch (n) {
    case 0:
      message.body('\nServer error: ' + status);
      break;
    case 1:
      message.body('\nInternet connection not available\n\nPlease check your phone');
      break;
    case 2:
      message.body('\nPosition not available\n\nPlease check your phone');
      break;
    case 3:
      //message.banner('images/icon_100.png');
      message.body('\n   Log in on your phone');
      break;
    case 4:
      //message.banner('images/icon_100.png');
      message.body('\n    Authorization failed\n   Log in on your phone');
      break;
  }
  message.id = 0;
  message.show();
}

// Authorization
function authorize() {
  display_message(3);
  wait.hide();
  Pebble.openURL(config_page);
}

// Check connectivity, determine ajax error and display message
function ajax_error(error, status) {
  "use strict";
  if (status == 401) {
    display_message(4);
    Pebble.openURL(config_page);    
  } else {
    ajax({url: 'http://google.com', type: 'text' },
      function(data) { display_message(0, error, status); },
      function(error) { display_message(1); }
    );
  }
}

// Create menus
var menu1 = new UI.Menu({
  highlightBackgroundColor: 'darkCandyAppleRed'
});
var menu2 = new UI.Menu({
  highlightBackgroundColor: 'darkCandyAppleRed'
});
var menu3 = new UI.Menu({
  highlightBackgroundColor: 'darkCandyAppleRed',
  sections: [{
    items: [{
      title: 'item fullscreen',
    }, {
      title: 'reload list',
    }, {
      title: 'delete crossed off'
    }]
  }]
});

function parse_menu2(data) {
  var items = { on: [], off: [] };
  data.list.items.forEach(function(e, i, a) {
    if (data.list.items[i].crossedOff) {
      items.off.push({ title: '-' + data.list.items[i].value + '-', id: data.list.items[i].id, crossedOff: data.list.items[i].crossedOff });
    } else {
      items.on.push({ title: data.list.items[i].value, id: data.list.items[i].id, crossedOff: data.list.items[i].crossedOff });
    }
  });
  menu2.section(0, { items: items.on });
  menu2.section(1, { title: 'Crossed off', items: items.off });
}

function load_menu2() {
  "use strict";
  ajax({ url: encodeURI(base_url + api_query + '&auth=' + localStorage.getItem('auth') + '&data={"command":"getCategoryList","teamId":"' + localStorage.getItem('teamId') + '"}'), type: 'json' },
    function(data) {
      data.categoryList.forEach(function(e, i, a) {
        categoryList[e.id] = [i, e.value];
      });
      //console.log(JSON.stringify(categoryList));
      ajax({ url: encodeURI(base_url + api_query + '&auth=' + localStorage.getItem('auth') + '&data={"command":"getList","listId":"' + listId + '","teamId":"' + localStorage.getItem('teamId') + '"}&level=2'), type: 'json' },
        function(data) {
          if (data == "unauthorized") {
            authorize();
          } else {
            parse_menu2(data);
            menu2.show();
            Light.trigger();
            wait.hide();
          }
        },
        function(error, status) {
          ajax_error(error, status);
        }
      );
    },
    function(error, status) {
      ajax_error(error, status);
    }
  );
  wait.show();
}

function displayActiveCount(list) {
  return (list.activeCount === 0 ? 'empty' : list.activeCount + ' item' + (list.activeCount == 1 ? '' : 's'));
}

menu1.on('select', function(event) {
  "use strict";
  listId = event.item.id;
  listIndex = event.itemIndex;
  load_menu2();
});

menu1.on('longSelect', function(event){
  main(true);
});

menu2.on('select', function(event) {
  "use strict";
  /*var items = menu2.items(event.sectionIndex);
  items.splice(event.itemIndex, 1);
  menu2.items(event.sectionIndex, items);
  if (event.sectionIndex) {
    event.item.title = event.item.title.substr(1, event.item.title.length - 2);
  } else {
    event.item.title = '-' + event.item.title + '-';
  }
  items = menu2.items(1 - event.sectionIndex);
  items.push(event.item);
  menu2.items(1 - event.sectionIndex, items);*/
  ajax({ url: encodeURI(base_url + api_query + '&auth=' + localStorage.getItem('auth') + '&data={"command":"setItemCrossedOff","itemId":"' + event.item.id + '","listId":"' + listId + '","crossedOff":' + !event.item.crossedOff + ',"teamId":"' + localStorage.getItem('teamId') + '"}&level=3'), type: 'json' },
    function(data) {
      if (data == "unauthorized") {
        authorize();
      } else {
        parse_menu2(data);
        var list = menu1.item(0, listIndex);
        list.activeCount += 2 * event.sectionIndex - 1; // update on categories
        if (list.activeCount < 0) {
          main(false);
        } else {
          list.subtitle = displayActiveCount(list);
          menu1.item(0, listIndex, list);              
        }
      }
    },
    function(error, status, request) {
      // eventual reverse action
      ajax_error(error, status);
    }
  );
});

menu2.on('longSelect', function(event){
  menu3.show();
  details.body(event.item.title);
});

menu3.on('select', function(event) {
  switch (event.itemIndex) {
    case 0:
      details.show();
      menu3.hide();
      break;
    case 1:
      load_menu2();
      menu3.hide();
      break;
    case 2:
      ajax({ url: encodeURI(base_url + api_query + '&auth=' + localStorage.getItem('auth') + '&data={"command":"deleteAllCrossedOffItems","listId":"' + listId + '","teamId":"' + localStorage.getItem('teamId') + '"}&level=4'), type: 'json' },
        function(data) {
          if (data == "unauthorized") {
            authorize();
          }
        },
        function(error, status, request) {
          ajax_error(error, status);
        }
      );
      menu2.items(1, []);  // update on categories
      menu3.hide();
      break;
  }
});

Pebble.addEventListener('showConfiguration', function(e) {
  "use strict";
  Pebble.openURL(config_page);
});

function main(show) {
  "use strict";
  if (localStorage.getItem('auth') && localStorage.getItem('teamId')) {
    ajax({ url: encodeURI(base_url + api_query + '&auth=' + localStorage.getItem('auth') + '&data={"command":"getOverview","teamId":"' + localStorage.getItem('teamId') + '"}&level=1'), type: 'json' },
      function(data, status, request) {
        if (data == "unauthorized") {
          authorize();
        } else {
          var items = [];
          data.shoppingLists.forEach(function (e, i, a) {
            items.push({ title: data.shoppingLists[i].name, subtitle: displayActiveCount(data.shoppingLists[i]), id: data.shoppingLists[i].id, activeCount: data.shoppingLists[i].activeCount });
          });
          menu1.section(0, { title: 'Your lists', items: items });
          if (show) {
            menu1.show();
            Light.trigger();
            wait.hide();
          }
        }
      },
      function(error, status) {
        ajax_error(error, status);
      }
    );
    if (show) wait.show();
  } else {
    authorize();
  }
}

Pebble.addEventListener('webviewclosed',
  function(e) {
    var config = JSON.parse(decodeURIComponent(e.response));
    localStorage.setItem('auth', config.auth);
    localStorage.setItem('teamId', config.teamId);
    main(true);
    message.hide();
  }
);

main(true);