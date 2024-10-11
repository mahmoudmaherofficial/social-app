setupUi();

// Get user
function getUser() {
  toggleLoader(true);
  // Get the userId from the url parameters
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("userId");

  // Make an API call to get the user
  axios
    .get(`${baseUrl}/users/${userId}`)
    .then((response) => {
      // Get the user from the response
      let user = response.data.data;

      // Set the profile name to the user's name
      document.getElementById("profile-name").innerHTML = user.name;

      // Set the profile username to the user's username
      document.getElementById("profile-username").innerHTML = `@${user.username}`;

      // If the user has an email, set the profile email to their email
      if (user.email) {
        document.getElementById("profile-email").innerHTML = `<i class="fa-regular fa-envelope"></i> ${user.email}`;
      }

      // Set the profile picture to the user's profile image
      document.getElementById("profile-pic").src = user.profile_image;

      // Set the posts count to the number of posts the user has
      document.getElementById("posts-count").innerHTML = user.posts_count;

      // Set the comments count to the number of comments the user has
      document.getElementById("comments-count").innerHTML = user.comments_count;

      // Set the profile posts title to the user's name + 's Posts'
      document.getElementById("profile-posts-title").innerHTML = `${user.name.split(" ")[0]}'s Posts`;

      // Get the user's posts
      getUserPosts(userId);
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}

getUser();

function getUserPosts(userId) {
  toggleLoader(true);
  const posts = document.getElementById("posts");
  axios
    .get(`${baseUrl}/users/${userId}/posts`)
    .then((response) => {
      for (const post of response.data.data.reverse()) {
        let postMarkup = `
          <!-- POST -->
          <div class="card post shadow-sm" id="${post.id}" >
            <div class="card-header d-flex justify-content-between">
              <div class="d-flex gap-2">
                <img src="${post.author.profile_image}" alt="" class="rounded-circle" />
                <div>
                  <h5 class="card-title">${post.author.name}</h5>
                  <p>&commat;${post.author.username}</p>
                </div>
              </div>
              <div id="edit-post-${post.id}" class="btn-group"></div>
            </div>
            <div onclick="getPost(${post.id})">
              <img src="${post.image}" alt="" class="card-img-bottom" />
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
              </section>
            </div>
          </div>
          <!-- POST // -->
        `;
        posts.innerHTML += postMarkup;
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        const editPostWrapper = document.getElementById(`edit-post-${post.id}`);
        if (token != null && user != null && user.id == post.author.id) {
          editPostWrapper.innerHTML = `
          <button onclick="editBtnClicked('${encodeURIComponent(JSON.stringify(post))}')" type="button" class="btn btn-sm btn-outline-success">Edit post <i class="fa-solid fa-pen"></i></button>
          <button onclick="deleteBtnClicked('${encodeURIComponent(JSON.stringify(post))}')" type="button" class="btn btn-sm btn-outline-danger"><i class="fa-solid fa-trash"></i></button>
          `;
        } else {
          editPostWrapper.innerHTML = "";
        }
        const currentPostID = `post-tags-${post.id}`;
        for (const tag of post.tags) {
          let tagsMarkup = `
          <div class="tag rounded-pill bg-secondary text-light py-1 px-3">
          ${tag}
          </div>`;
          document.getElementById(currentPostID).innerHTML += tagsMarkup;
        }
      }
    })
    .catch((error) => {
      showAlert("Can't Load the Posts, Reload the Page", "danger");
      console.log(error);
    }).finally(() => {
      toggleLoader(false);
    })
}
