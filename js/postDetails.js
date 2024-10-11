setupUi();
getPostDetails();

function getPostDetails() {
  toggleLoader(true);
  let queryParams = new URLSearchParams(window.location.search);
  let postId = queryParams.get("postId");

  const posts = document.getElementById("posts");
  axios
    .get(`${baseUrl}/posts/${postId}`)
    .then((response) => {
      const post = response.data.data;
      let postMarkup = `
      <!-- POST -->
      <div class="d-flex justify-content-start align-items-center">
        <i class="fa-solid fa-arrow-left fs-3 ms-2 text-secondary" style="cursor: pointer; line-height: 0;" onclick="window.history.back()"></i>
        <h2 id="post-author-name">${post.author.name}'s Post</h2>
      </div>
      <div class="card post shadow-sm" id="${post.id}">
        <div class="card-header">
            <img src="${post.author.profile_image}" alt="" class="rounded-circle" />
            <div>
              <h5 class="card-title">${post.author.name}</h5>
              <p>&commat;${post.author.username}</p>
            </div>
        </div>
        <img src="${post.image == null ? "../imgs/user.jpg" : post.image}" alt="" class="card-img-bottom" />
        <section id="info" class="py-2 px-3">
          <p class="text-secondary post-date">${post.created_at}</p>
          ${post.title != null ? "<h4>" + post.title + "</h4>" : ""}
          <p class="post-caption">${post.body}</p>
          <hr />
          <data class="d-flex gap-2 align-items-center">
            <i class="fa-solid fa-pencil"></i>
            <p class="comments">
              <span class="comments-num">(${post.comments_count})</span>
              Comments
            </p>
            <nav class="d-flex gap-1" id="post-tags-${post.id}">
            </nav>
          </data>
          <div id="post-comments-${post.id}"></div>
          <div class="input-group mt-3">
            <input type="text" class="form-control" id="comment-text" />
            <button class="btn btn-primary" type="button" id="add-comment-btn" onclick="addCommentToPost()">Send<i class="fa-solid fa-paper-plane ms-2"></i></button>
          </div>
        </section>
      </div>
      <!-- POST // -->
    `;
      posts.innerHTML = postMarkup;
      let currentPost = `post-comments-${post.id}`;
      let comments = document.getElementById(currentPost);
      for (const comment of post.comments.reverse()) {
        // console.log(comment);
        let commentMarkup = `
        <div class="card mt-3">
          <div class="card-header">
            <img src="${comment.author.profile_image}" alt="" class="rounded-circle" />
            <div>
              <h5 class="card-title">${comment.author.name}</h5>
              <p>&commat;${comment.author.username}</p>
            </div>
          </div>
          <section class="py-2 px-3">${comment.body}</section>
        </div>
      `;
        comments.innerHTML += commentMarkup;
      }
    })
    .finally(() => {
      toggleLoader(false);
    });
} // Add comment function
function addCommentToPost() {
  toggleLoader(true);
  const commentTextInput = document.getElementById("comment-text");
  const postId = getPostIdFromUrl();

  axios
    .post(
      `${baseUrl}/posts/${postId}/comments`,
      { body: commentTextInput.value },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then(() => {
      commentTextInput.value = "";
      getPostDetails();
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

function getPostIdFromUrl() {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get("postId");
}
