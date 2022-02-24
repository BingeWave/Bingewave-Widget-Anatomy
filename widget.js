//Event Publisher/Listener when part is selected
let selectAreaEvent = BWProperties.namespace + '_area_selected';

//Event Publisher/Listener for when a part is deselected
let deSelectAreaEvent = BWProperties.namespace + '_area_deselected';

//Record events published
let sentEvents = [];

//Container for holding selected parts
let selectionsID = '#' + BWProperties.namespace + '_selections';

//The id of the image
let imageID = '#' + BWProperties.namespace + "_body_image";

//The image
let image = $(imageID);

//Items currently selected
let selectedItems = [];

$(selectionsID).html(selectedItems.length > 0 ? "<b>Selected body Parts: </b>" + selectedItems : "<b>Please select a body part</b>");


image.mapster({
    fillOpacity: 0.4,
    fillColor: "d42e16",
    strokeColor: "3320FF",
    strokeOpacity: 0.8,
    strokeWidth: 4,
    stroke: true,
    isSelectable: true,
    singleSelect: false,
    mapKey: 'name',
    listKey: 'key',
    onClick: function(e) {

        if ($.inArray(e.key, selectedItems) >= 0) {
            selectedItems.splice($.inArray(e.key, selectedItems), 1);

            BWEvents.publish(deSelectAreaEvent, {
                area: e.key
            }).then(response => {
                if (response.id) {
                    sentEvents.push(response.id);
                }
            });
          
        } else {
            selectedItems.push(e.key);

            BWEvents.publish(selectAreaEvent, {
                area: e.key
            }).then(response => {
                if (response.id) {
                    sentEvents.push(response.id);
                }
            });
        }
      
        //Set the selected_items
        BWState.set('selected_items', selectedItems);
        
        //Update list of selected body parts
        $(selectionsID).html(selectedItems.length > 0 ? "<b>Selected body Parts: </b>" + selectedItems.toString().replace(new RegExp('_', 'g'), " ").replace(new RegExp(',', 'g'), ", ") : "<b>Please select a body part</b>");


    },
    showToolTip: true,
    toolTipClose: ["tooltip-click", "area-click"],
});


//Listen for when part is selected
BWEvents.subscribe(selectAreaEvent, 'listener_1', function(response, event_id) {

    let area = response.area;

    //only execute if not sender
    if (area && !sentEvents.includes(event_id)) {
        $(`[name="${area}"]`).mapster('select');
        selectedItems.push(area);
    }
});

//Listen for when part is unselected
BWEvents.subscribe(deSelectAreaEvent, 'listener_1', function(response, event_id) {
    let area = response.area;

    //only execute if not sender
    if (area && !sentEvents.includes(event_id)) {
        $(`[name="${area}"]`).mapster('deselect');
        selectedItems.splice($.inArray(area, selectedItems), 1);
    }
});

function init() {
  
  BWState.get('selected_items').then((response) => {
    
    if(response.status == "success" && response.data.state && response.data.state){
      let state = response.data.state;
      
      state.forEach(area => {
         $(`[name="${area}"]`).mapster('select');
        selectedItems.push(area);
      });
    }
 });
  
}

init();
