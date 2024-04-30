const SUPABASE_URL = 'https://iwjygprrmbkssvcpbdpz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3anlncHJybWJrc3N2Y3BiZHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMyODI4NjAsImV4cCI6MjAyODg1ODg2MH0.xYNt7yBxi6os26Uzi-_pk_YPR4bC7A3VsIzt9njt5Jk'
var _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function addToContents(data) {
    var div
    for (var i = 0; i < data.length; i++) {
        div = document.createElement('div')
        div.innerHTML = data[i].tag
        document.getElementById('holder').appendChild(div)
    }
}

async function loadData() {
    const { data, error } = await _supabase
            .from("People")
            .select("*")

    if(!error) {
        const parent = document.getElementById('holder')

        let contents = ''
        data.forEach(function(item){
            contents += `<div> ${item.PersonID}}</div>` 
        })

        parent.insertAdjacentHTML('beforeend', contents)
    }
    console.log('Hello World')
    console.log(data)
    console.log(error)
    
}
loadData()
