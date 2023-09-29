class ResultsDisplay
{
    constructor(resultsManager, resultsElement){
        this.resultsManager = resultsManager;
        this.resultsManager.registerResultsListener(this);
        this.resultsElement = resultsElement;
    }

    clearResults()
    {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        let x = document.getElementsByClassName("search-items");
        for (var i = 0; i < x.length; i++) 
        {
            x[i].parentNode.removeChild(x[i]);
        }

        let button = document.getElementsByClassName("pagination-buttons");
        for (var i = 0; i < button.length; i++) 
        {
            button[i].parentNode.removeChild(button[i]);
        }
    }


    createResultsParent()
    {
        /*create a DIV element that will contain the items (values):*/
        let a = document.createElement("DIV");
        a.setAttribute("id","search-list");
        a.setAttribute("class", "search-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.resultsElement.appendChild(a);
        return a;
    }

    createNextPageButtons()
    {
        /*create a DIV element that will contain the items (values):*/
        let a = document.createElement("DIV");
        a.setAttribute("id","page-buttons");
        a.setAttribute("class", "pagination-buttons");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentsDiv.appendChild(a);
        
        let previousPageButton = document.createElement("BUTTON");
        previousPageButton.setAttribute("id", "prevPage");
        previousPageButton.innerHTML = "Previous";

        let nextPageButton = document.createElement("BUTTON");
        nextPageButton.setAttribute("id", "nextPage");
        nextPageButton.innerHTML = "Next";

        a.appendChild(previousPageButton);
        a.appendChild(nextPageButton);

        nextPageButton.addEventListener("click", (e) => {
                                            this.resultsManager.updateToNextPage();
                                        });
                        
        previousPageButton.addEventListener("click", (e) => {
                                                this.resultsManager.updateToPreviousPage();
                                            });
        return a;
    }



    updateResults(items){
        this.clearResults();
        this.parentsDiv = this.createResultsParent();
        for(let i = 0; i< items.length; ++i)
        {
            let b = document.createElement("DIV");
            b.innerHTML = "id = " + items[i].id + "\t name = " + items[i].name + "price" + items[i].price + "\n";
            this.parentsDiv.appendChild(b);
        }
        this.createNextPageButtons();
    }
}