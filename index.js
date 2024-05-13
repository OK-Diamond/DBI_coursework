const SUPABASE_URL = 'https://iwjygprrmbkssvcpbdpz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3anlncHJybWJrc3N2Y3BiZHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMyODI4NjAsImV4cCI6MjAyODg1ODg2MH0.xYNt7yBxi6os26Uzi-_pk_YPR4bC7A3VsIzt9njt5Jk';
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
                    personid: ${data[item].PersonID} <br>
                    name: ${data[item].Name} <br>
                    address: ${data[item].Address} <br>
                    dob: ${data[item].DOB} <br>
                    licensenumber: ${data[item].LicenseNumber} <br>
                    expirydate: ${data[item].ExpiryDate} <br>
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
        message_content = `<p>Error: Fields is empty</p>`;
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

async function db_add(rego = "", make = "", model = "", colour = "", owner = "", license = "") {
    console.log("a rego:", rego, " make:", make, " model:", model, " colour:", colour, " owner:", owner);

    // Get max person id (in case a new person is added)
    var {data, error} = await _supabase.from("People").select("PersonID(count)");
    var max_person_id = data.length;

    // Check if owner is stored
    var {data, error} = await _supabase
        .from("People")
        .select("*")
        .filter('Name', 'ilike', '*'+owner+'*');
    if(!error) {
        if (data.OwnerID == null || data.OwnerID.length == 0) {
            console.log("Owner not found");
            var {error} = await _supabase
                .from("People")
                .insert(
                    {PersonID: max_person_id+1, Name: owner, LicenseNumber: license}
                );
            if(!error) {
                console.log("Owner added");
            } else {
                console.log("Owner add failed: ", error);
            }
        } else {
            console.log("Owner found:", data.Name);
        }
    }

    // Add vehicle
    var {error} = await _supabase
        .from("Vehicles")
        .insert([
            {VehicleID: rego, Make: make, Model: model, Colour: colour, OwnerID: owner}
        ]);
    if(!error) {
        console.log("Vehicle added");
    } else {
        console.log("Vehicle add failed: ", error);
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

function av_submit() {
    db_add(
        rego = document.getElementById('rego').value, 
        model = document.getElementById('model').value, 
        colour = document.getElementById('colour').value, 
        name = document.getElementById('name').value, 
        dob = document.getElementById('dob').value, 
        address = document.getElementById('address').value, 
        license_num = document.getElementById('license_num').value, 
        license_exp = document.getElementById('license_exp').value, 
    );
}

console.log(window.location.pathname.split("/").pop());

//document.querySelector("#submit").addEventListener("keyup", event => {
//    if(event.key !== "Enter") return; // Use `.key` instead.
//    document.querySelector("#submit").click(); // Things you want to do.
//    event.preventDefault(); // No need to `return false;`.
//});
