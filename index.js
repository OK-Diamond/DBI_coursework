const SUPABASE_URL = 'https://iwjygprrmbkssvcpbdpz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3anlncHJybWJrc3N2Y3BiZHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMyODI4NjAsImV4cCI6MjAyODg1ODg2MH0.xYNt7yBxi6os26Uzi-_pk_YPR4bC7A3VsIzt9njt5Jk'
var _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function loadData() {
    const { data, error } = await _supabase
            .from('People')
            .select()

    if(!error) {
        const parent = document.getElementById('holder')

        let contents = ''
        data.forEach(function(item){
            contents += `<div> ${item.title} - ${item.tag}</div>` 
        })

        parent.insertAdjacentHTML('beforeend', contents)
    }
    
}
loadData()