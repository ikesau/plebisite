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

    $('.comment__reply-link').on('click', function(event) { // inline replying
        event.preventDefault()

        $(this).replaceWith(`
        <form class="comment__reply-form" action="${$(event.currentTarget).attr('href')}" method="POST">
            <input class="comment__reply-input" name="comment" type="text" placeholder="Write your reply"></input>
            <button class="comment__reply-button" type="submit">Submit</button>
            <button class="comment__cancel-button">Cancel</button>
        </form>
        `)
    })

});
