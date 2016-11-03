/* global $*/

$(document).ready(function() {
    $('.post__vote-button').on('click', function() {
        
        var value = $(this).data('value');
        var postId = $(this).data('postid');
        var displayVote = $(this).parents().children('.post__vote-value');
        var displayVoteValue = parseInt(displayVote.text());
        
        $(displayVote).text(displayVoteValue + value);
        
        $.post('/vote',{
            value: value,
            postId: postId
        }, function(response) { // only returns something if there's an error
            console.error(response);
        });
    });
    
})