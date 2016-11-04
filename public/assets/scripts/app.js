/* global $*/

$(document).ready(function() {
    $('.post__vote-button').on('click', function() { // front-end voting

        var value = $(this).data('value');
        var postId = $(this).data('postid');
        var displayVote = $(this).parents().children('.post__vote-value');
        var displayVoteValue = parseInt(displayVote.text());

        if (!$(this).children('i').hasClass('active')) {

            $(displayVote).text(displayVoteValue + value); // Updates displayVote

            switch (value) { // Colours the appropriate arrow
                case 1:
                    {
                        $(this).children('i').addClass('active');
                        break;
                    }
                case -1:
                    {
                        $(this).children('i').addClass('active');
                        break;
                    }
            }

            $(this).siblings('button').children('i').removeClass('active'); // de-colours the other arrow

            $.post('/vote', { // Sends vote information to the server
                value: value,
                postId: postId
            }, function(response) { // /vote route only returns reponse if there's an error
                console.error(response);
            });

        }
        else {
            $(displayVote).text(displayVoteValue - value);

            $(this).children('i').removeClass('active');

            $.post('/vote', { // Sends vote information to the server
                value: 0,
                postId: postId
            }, function(response) { // /vote route only returns reponse if there's an error
                console.error(response);
            });
        }


    });

})
