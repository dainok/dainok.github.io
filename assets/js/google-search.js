var form = document.querySelector("form");

if (form !== null && form !== undefined) {
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        var search = form.querySelector("input[type=search]");
        search.value = "site:adainese.it " + search.value;
        form.submit();
    });
}
