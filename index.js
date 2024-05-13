const SUPABASE_URL = 'https://iwjygprrmbkssvcpbdpz.supabase.co';
var _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function db_search_ps(name, license) {
    console.log("p name: ["+name+"] license: ["+license+"]");
    var {data, error} = await _supabase
        .from("People")
        .select("*")
        .filter('Name', 'ilike', '*'+name+'*')
        .filter('LicenseNumber', 'ilike', '*'+license+'*');
    
    var result_div = document.getElementById('results');
    var message_div = document.getElementById('message');
    var result_content = "";
    var message_content = "";
    if (error) {
        message_content = `<p>Error: ${error}</p>`;
    } else if (name == "" && license == "") {
        message_content = `<p>Error: Both fields are empty</p>`;
    } else if (name != "" && license != "") {
        message_content = `<p>Error: Both fields are filled</p>`;
    } else {
        if (data.length == 0) {
            message_content = `<p>No results found</p>`;
        } else {
            message_content = `<p>Search successful</p>`;
            for (var item = 0; item < data.length; item++) {
                result_content += `<div>
                    <p>personid: ${data[item].PersonID} </p>
                    <p>name: ${data[item].Name} </p>
                    <p>address: ${data[item].Address} </p>
                    <p>dob: ${data[item].DOB} </p>
                    <p>licensenumber: ${data[item].LicenseNumber} </p>
                    <p>expirydate: ${data[item].ExpiryDate} </p>
                </div>`;
            }
        }
    }
    // Add results to the page
    result_div.innerHTML = "";
    result_div.insertAdjacentHTML('beforeend', result_content);
    message_div.innerHTML = "";
    message_div.insertAdjacentHTML('beforeend', message_content);
}

async function db_search_vs(rego) {
    console.log("v rego:", rego);
    
    // Get joined table
    var {data, error} = await _supabase
        .from("Vehicles")
        .select("*, People!inner(Name, LicenseNumber)")
        .filter('VehicleID', 'ilike', '*'+rego+'*');
    var d1 = data;
    var e1 = error;
    console.log("join", d1);

    // Get unjoined table
    var {data, error} = await _supabase
        .from("Vehicles")
        .select("*")
        .filter('VehicleID', 'ilike', '*'+rego+'*');
    var d2 = data;
    var e2 = error;
    console.log("unjoin", d2);

    // Remove duplicates from unjoined table
    for (var i = 0; i < d1.length; i++) {
        for (var j = 0; j < d2.length; j++) {
            if (d1[i].VehicleID == d2[j].VehicleID) {
                d2.splice(j, 1);
            }
        }
    }

    var result_div = document.getElementById('results');
    var message_div = document.getElementById('message');
    var result_content = "";
    var message_content = "";
    
    if (e1 || e2) {
        message_content = `<p>Error: ${e1} ${e2}</p>`;
    } else if (rego == "") {
        message_content = `<p>Error: Field is empty</p>`;
    } else {
        if (d1.length == 0 && d2.length == 0) {
            message_content += "<p>No results found</p>";
        } else {
            message_content += "<p>Search successful</p>";
            // Display joined table
            for (var item = 0; item < d1.length; item++) {
                result_content += `<div>
                    vehicleid: ${d1[item].VehicleID} <br>
                    make: ${d1[item].Make} <br>
                    model: ${d1[item].Model} <br>
                    colour: ${d1[item].Colour} <br>
                    owner: ${d1[item].People.Name} <br>
                    licencenumber: ${d1[item].People.LicenseNumber} <br>
                </div>`;
            }
            // Display unjoined table
            for (var item = 0; item < d2.length; item++) {
                result_content += `<div>
                    vehicleid: ${d2[item].VehicleID} <br>
                    make: ${d2[item].Make} <br>
                    model: ${d2[item].Model} <br>
                    colour: ${d2[item].Colour} <br>
                </div>`;
            }
        }
    }
    // Add results to the page
    console.log(result_content);
    result_div.innerHTML = "";
    result_div.insertAdjacentHTML('beforeend', result_content);
    message_div.innerHTML = "";
    message_div.insertAdjacentHTML('beforeend', message_content);
}

async function db_add_v(rego, make, model, colour, owner_id) {
    console.log("a rego:", rego, " make:", make, " model:", model, " colour:", colour, " owner_id:", owner_id);

    var message_div = document.getElementById('message');

    // Add vehicle
    var {error} = await _supabase
        .from("Vehicles")
        .insert([
            {VehicleID: rego, Make: make, Model: model, Colour: colour, OwnerID: owner_id}
        ]);
    if(!error) {
        console.log("Vehicle added");
        message_div.insertAdjacentHTML('beforeend', "Vehicle added successfully <br>");
    } else {
        console.log("Vehicle add failed: ", error);
        message_div.insertAdjacentHTML('beforeend', "Vehicle add failed <br>");
    }
}

function ps_submit() {
    db_search_ps(
        name = document.getElementById('name').value, 
        license = document.getElementById('license').value
    );
}

function vs_submit() {
    db_search_vs(
        rego = document.getElementById('rego').value
    );
}

async function av_submit_v(reset_message = true) {
    console.log("av_submit_v");
    // Reset message
    var message_div = document.getElementById('message');
    if (reset_message) {
        message_div.innerHTML = "";
    }

    // Check if owner is stored
    var {data, error} = await _supabase
        .from("People")
        .select("*")
        .filter('Name', 'ilike', '*'+document.getElementById('owner').value+'*');
    console.log(data);

    if(!error) {
        if (data == null || data.length == 0) { // Owner not found
            message_div.insertAdjacentHTML('beforeend', "Owner not found. Please add owner first. <br>");
            document.getElementById("p_input").style.display = "block";
        } else {
            db_add_v(
                rego = document.getElementById('rego').value, 
                make = document.getElementById('make').value, 
                model = document.getElementById('model').value, 
                colour = document.getElementById('colour').value, 
                owner_id = data[0].PersonID
            );
        }
    } else {
        message_div.insertAdjacentHTML('beforeend', "Error: "+error+"<br>");
        document.getElementById("p_input").style.display = "block";
    }
}

async function av_submit_p() {
    console.log("av_submit_p");
    // Reset message
    var message_div = document.getElementById('message');
    message_div.innerHTML = "";

    // Generate person id
    var p_id = document.getElementById('personid').value;
    if (p_id == "") {
        var {data, error} = await _supabase
            .from("People")
            .select("PersonID(count)");
        p_id = 1+data.length;
    }

    // Add person
    var {error} = await _supabase
        .from("People")
        .insert([
            {PersonID: p_id, 
            Name: document.getElementById('name').value, 
            Address: document.getElementById('address').value, 
            DOB: document.getElementById('dob').value, 
            LicenseNumber: document.getElementById('license').value, 
            ExpiryDate: document.getElementById('expire').value}
        ]);
    if(!error) {
        message_div.insertAdjacentHTML('beforeend', "Person added successfully <br>");
    } else {
        message_div.insertAdjacentHTML('beforeend', "Person add failed: "+error+" <br>");
    }

    setTimeout(av_submit_v(reset_message = false), 1000); // Wait 1 second for person to be added
     // Submit the vehicle again
}


page = console.log(window.location.pathname.split("/").pop());


 // Submit on enter
var input_list = [];
 if (page == "people.html" || page == "vs.html") {
    input_list = ["submit"];
} else if (page == "av.html") {
    input_list = ["submit_v", "submit_p"];
}

for (i = 0; i < input_list.length; i++) {
    var input = document.getElementById(input_list[i]);
    input.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById(input_list[i]).click();
        }
    });
}
