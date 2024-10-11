setupUi();
getPosts();

// function to get posts
let lastPage = 0;
function getPosts(page) {
  toggleLoader(true);
  const posts = document.getElementById("posts");
  axios
    .get(`${baseUrl}/posts?limit=15&page=${page}`)
    .then((response) => {
      for (const post of response.data.data) {
        let postMarkup = `
          <!-- POST -->
          <div class="card post shadow-sm" id="${post.id}" >
            <div class="card-header d-flex justify-content-between">
              <div class="d-flex gap-2" onclick="getProfile(${post.author.id})">
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
        lastPage = response.data.meta.last_page;
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
    })
    .finally(() => {
      toggleLoader(false);
    });
}
//  function to handle pagination
let currentPage = 1;
window.addEventListener("scroll", () => {
  handleInfiniteScrolling();
  function handleInfiniteScrolling() {
    const endOfPage = window.innerHeight + window.scrollY >= document.body.scrollHeight;
    if (endOfPage && currentPage <= lastPage) {
      currentPage++;
      getPosts(currentPage);
    }
  }
});

// function to get profile
function getProfile(userId) {
  window.location = `profile.html?userId=${userId}`;
}
