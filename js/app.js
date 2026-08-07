document.addEventListener("DOMContentLoaded", () => {

    const result = analyzeAccount(accounts[0]);

    console.log("ENGINE RESULT:", result);


    const scoreElement = document.getElementById("score");
    const recommendationElement = document.getElementById("recommendation");


    if(scoreElement){

        scoreElement.textContent = result.score;

    }


    if(recommendationElement){

        recommendationElement.textContent =
            result.recommendation;

    }

});
