
var documents = [{
    "id": 0,
    "url": "http://localhost:4000/404.html",
    "title": "404",
    "body": "404 Page does not exist!Please use the search bar at the top or visit our homepage! "
    }, {
    "id": 1,
    "url": "http://localhost:4000/about",
    "title": "About Me",
    "body": "Hi, I’m Kevin—a software engineer, tech enthusiast, and lifelong learner passionate about building and exploring the ever-evolving world of technology. 💻✨ I started this blog to document my journey, share insights, and provide valuable resources for developers at all stages of their careers. Whether you're just starting out in tech, looking for tips and tricks, or seeking inspiration for your next big project, you’ve come to the right place! What You'll Find Here  Go (Golang) Tips and Troubleshooting: Deep dives into Go’s features, tips for mastering the language, and solutions to common challenges.   Project Insights: Behind-the-scenes looks at projects I’m working on or tools I’ve built.   Tech Musings: Reflections on trends, ideas, and the future of technology.   Career &amp; Community: Thoughts on career growth, personal development, and contributing to the tech community. My MissionI believe in the power of sharing knowledge and building a supportive developer community. My goal is to create content that informs, inspires, and empowers you to grow in your tech journey. A Little More About MeWhen I’m not coding or writing, you’ll likely find me:   Experimenting with new tech tools and frameworks  Playing basketball 🏀  Enjoying a good cup of coffee ☕ or binge-watching NetflixThanks for visiting, and I hope you find something here that inspires or helps you. Happy coding, and happy Go-ing! 🐹✨ Buy me a coffeeThank you for your support! Your donation helps me to maintain and improve Omnia Blog. Buy me a coffee "
    }, {
    "id": 2,
    "url": "http://localhost:4000/categories",
    "title": "Categories",
    "body": ""
    }, {
    "id": 3,
    "url": "http://localhost:4000/",
    "title": "Home",
    "body": "      Featured:                     All Stories:                                                                                                     Fun and Surprising Go Facts You Probably Didn’t Know!      :       Here are some lesser-known Go (Golang) facts that even go developers might not know::                                                                               Kevin                12 Dec 2024                                            "
    }, {
    "id": 4,
    "url": "http://localhost:4000/robots.txt",
    "title": "",
    "body": "      Sitemap: {{ “sitemap. xml”   absolute_url }}   "
    }, {
    "id": 5,
    "url": "http://localhost:4000/fun-go-facts/",
    "title": "Fun and Surprising Go Facts You Probably Didn’t Know!",
    "body": "2024/12/12 - Here are some lesser-known Go (Golang) facts that even go developers might not know: 1. Go’s nil Has Its Own Quirks: In Go, the nil value behaves unexpectedly when applied to interfaces. An interface can be nil, but its underlying type and value also determine how nil behaves. Example: 1234567var i interface{} = (*int)(nil)if i == nil {  fmt. Println( i is nil )} else {  fmt. Println( i is NOT nil )}Output: 1i is NOT nilWhy? Because while the underlying value is nil, the interface itself still holds a type (*int) and isn’t considered completely nil. 2. Go’s defer Uses LIFO (Last-In, First-Out): When multiple defer statements are used, they are executed in reverse order — like a stack. Example: 12345func main() {  defer fmt. Println( 1 )  defer fmt. Println( 2 )  defer fmt. Println( 3 )}Output: 123321This LIFO execution order is intentional and can be used strategically, such as ensuring resources are released in the opposite order they were acquired. 3. Go Has a Built-in Memory Alignment Trick: Go automatically aligns fields in a struct to optimize memory usage, but the order of fields matters. Example: 12345type Example struct {  A byte  B int64  C byte}Here, Go will add padding between fields to maintain memory alignment, resulting in more memory consumption than expected. Rearranging the fields can fix this: 1234567891011121314151617181920type ExampleOptimized struct {  B int64  A byte  C byte}func main() {  fmt. Printf( Size of Misaligned struct: %d bytes\n , unsafe. Sizeof(Misaligned{}))  fmt. Printf( Size of Aligned struct: %d bytes\n , unsafe. Sizeof(Aligned{}))  fmt. Printf( \nField offsets in Misaligned struct:\n )  fmt. Printf( A: %d\n , unsafe. Offsetof(Misaligned{}. A))  fmt. Printf( B: %d\n , unsafe. Offsetof(Misaligned{}. B))  fmt. Printf( C: %d\n , unsafe. Offsetof(Misaligned{}. C))  fmt. Printf( \nField offsets in Aligned struct:\n )  fmt. Printf( B: %d\n , unsafe. Offsetof(Aligned{}. B))  fmt. Printf( A: %d\n , unsafe. Offsetof(Aligned{}. A))  fmt. Printf( C: %d\n , unsafe. Offsetof(Aligned{}. C))}Output: 123456789101112Size of Example struct: 24 bytesSize of ExampleOptimized struct: 16 bytesField offsets in Example struct:A: 0B: 8C: 16Field offsets in ExampleOptimized struct:B: 0A: 8C: 9By grouping fields of similar size together, you can reduce memory usage significantly. 4. Go’s Empty Slice Isn’t Always nil: An uninitialized slice is nil, but a slice created with make() or an empty literal is not nil, even if it has no elements. Example: 1234567var s1 []ints2 := make([]int, 0)s3 := []int{}fmt. Println(s1 == nil) // truefmt. Println(s2 == nil) // falsefmt. Println(s3 == nil) // falseUnderstanding this distinction is critical when writing code that checks for “empty slices. ” 5. Go’s Complex select Behavior in Deadlocks: Go’s select statement, while powerful, has edge cases that can lead to unexpected behavior, especially with deadlocks. If all channels in a select block are blocked and there is no default case, the program deadlocks, but Go’s runtime handles this differently depending on the context. Example: 1234567891011121314151617181920212223package mainimport (   fmt    time )func main() {  ch1 := make(chan int)  ch2 := make(chan int)  go func() {    time. Sleep(1 * time. Second)    ch1 &lt;- 42  }()  select {  case val := &lt;-ch1:    fmt. Println( Received from ch1: , val)  case val := &lt;-ch2:    fmt. Println( Received from ch2: , val)  }}Behavior: If neither channel is ready and there’s no default case, the select blocks indefinitely. However, Go’s runtime avoids spinning CPU cycles inefficiently and places the goroutine into a sleep state until one of the channels becomes available. This behavior is subtle and can lead to tricky bugs when reasoning about concurrency. "
    }];

var idx = lunr(function () {
    this.ref('id')
    this.field('title')
    this.field('body')

    documents.forEach(function (doc) {
        this.add(doc)
    }, this)
});
function lunr_search(term) {
    document.getElementById('lunrsearchresults').innerHTML = '<ul></ul>';
    if(term) {
        document.getElementById('lunrsearchresults').innerHTML = "<p>Search results for '" + term + "'</p>" + document.getElementById('lunrsearchresults').innerHTML;
        //put results on the screen.
        var results = idx.search(term);
        if(results.length>0){
            //console.log(idx.search(term));
            //if results
            for (var i = 0; i < results.length; i++) {
                // more statements
                var ref = results[i]['ref'];
                var url = documents[ref]['url'];
                var title = documents[ref]['title'];
                var body = documents[ref]['body'].substring(0,160)+'...';
                document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML = document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML + "<li class='lunrsearchresult'><a href='" + url + "'><span class='title'>" + title + "</span><br /><span class='body'>"+ body +"</span><br /><span class='url'>"+ url +"</span></a></li>";
            }
        } else {
            document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML = "<li class='lunrsearchresult'>No results found...</li>";
        }
    }
    return false;
}

function lunr_search(term) {
    $('#lunrsearchresults').show( 400 );
    $( "body" ).addClass( "modal-open" );
    
    document.getElementById('lunrsearchresults').innerHTML = '<div id="resultsmodal" class="modal fade show d-block"  tabindex="-1" role="dialog" aria-labelledby="resultsmodal"> <div class="modal-dialog shadow-lg" role="document"> <div class="modal-content"> <div class="modal-header" id="modtit"> <button type="button" class="close" id="btnx" data-dismiss="modal" aria-label="Close"> &times; </button> </div> <div class="modal-body"> <ul class="mb-0"> </ul>    </div> <div class="modal-footer"><button id="btnx" type="button" class="btn btn-danger btn-sm" data-dismiss="modal">Close</button></div></div> </div></div>';
    if(term) {
        document.getElementById('modtit').innerHTML = "<h5 class='modal-title'>Search results for '" + term + "'</h5>" + document.getElementById('modtit').innerHTML;
        //put results on the screen.
        var results = idx.search(term);
        if(results.length>0){
            //console.log(idx.search(term));
            //if results
            for (var i = 0; i < results.length; i++) {
                // more statements
                var ref = results[i]['ref'];
                var url = documents[ref]['url'];
                var title = documents[ref]['title'];
                var body = documents[ref]['body'].substring(0,160)+'...';
                document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML = document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML + "<li class='lunrsearchresult'><a href='" + url + "'><span class='title'>" + title + "</span><br /><small><span class='body'>"+ body +"</span><br /><span class='url'>"+ url +"</span></small></a></li>";
            }
        } else {
            document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML = "<li class='lunrsearchresult'>Sorry, no results found. Close & try a different search!</li>";
        }
    }
    return false;
}
    
$(function() {
    $("#lunrsearchresults").on('click', '#btnx', function () {
        $('#lunrsearchresults').hide( 5 );
        $( "body" ).removeClass( "modal-open" );
    });
});