 /* =========================================
   STUDENT INFORMATION FORUM
   MAIN JAVASCRIPT
=======================================

/* =========================================
   PAGE ACCESS PROTECTION
========================================= */

const currentPage =
    window.location.pathname.split("/").pop();

const userRole =
    localStorage.getItem("userRole");


/* ADMIN PAGE */

if (currentPage === "admin.html") {

    if (userRole !== "admin") {

        alert("Access denied. Admins only.");

        window.location.href = "login.html";
    }
}


/* DESIGNER PAGE */

if (currentPage === "designer.html") {

    if (
        userRole !== "admin" &&
        userRole !== "designer"
    ) {

        alert("Access denied. Designers only.");

        window.location.href = "login.html";
    }
}


/* FORUM PAGE */

if (currentPage === "forum.html") {

    if (
        userRole !== "student" &&
        userRole !== "admin" &&
        userRole !== "designer"
    ) {

        alert("Please login first.");

        window.location.href = "login.html";
    }
}


/* COSMETICS SHOP */

if (currentPage === "cosmetics.html") {

    if (
        userRole !== "student" &&
        userRole !== "admin" &&
        userRole !== "designer"
    ) {

        alert("Please login first.");

        window.location.href = "login.html";
    }
}


/* =========================================
   SIGN UP
========================================= */

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const fullname = document.getElementById("fullname").value.trim();
        const studentID = document.getElementById("studentID").value.trim();
        const section = document.getElementById("section").value.trim();
        const email = document.getElementById("email").value.trim();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const coeFile = document.getElementById("coe").files[0];

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (!coeFile) {
            alert("Please upload your Certificate of Enrollment.");
            return;
        }

        let accounts = JSON.parse(
            localStorage.getItem("accounts")
        ) || [];

        const usernameExists = accounts.some(function(account) {
            return account.username === username;
        });

        if (usernameExists) {
            alert("Username already exists!");
            return;
        }

        const studentIDExists = accounts.some(function(account) {
            return account.studentID === studentID;
        });

        if (studentIDExists) {
            alert("Student ID already exists!");
            return;
        }

        const reader = new FileReader();

        reader.onload = function() {

            const newAccount = {
                fullname: fullname,
                studentID: studentID,
                section: section,
                email: email,
                username: username,
                password: password,
                status: "pending",
                coe: reader.result,
                points: 0
            };

            accounts.push(newAccount);

            localStorage.setItem(
                "accounts",
                JSON.stringify(accounts)
            );

            alert(
                "Registration submitted! Please wait for admin approval."
            );

            signupForm.reset();

            window.location.href = "login.html";
        };

        reader.readAsDataURL(coeFile);
    });
}


/* =========================================
   LOGIN
========================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const username =
            document.getElementById("username").value.trim();

        const password =
            document.getElementById("password").value;


        /* =================================
           SPECIAL ADMIN ACCOUNT
        ================================= */

        if (
            username === "admin" &&
            password === "Admin@123"
        ) {

            localStorage.setItem(
                "loggedInUser",
                "admin"
            );

            localStorage.setItem(
                "userRole",
                "admin"
            );

            alert("Admin login successful!");

            window.location.href = "admin.html";

            return;
        }


        /* =================================
           SPECIAL DESIGNER ACCOUNT
        ================================= */

        if (
            username === "designer" &&
            password === "Designer@123"
        ) {

            localStorage.setItem(
                "loggedInUser",
                "designer"
            );

            localStorage.setItem(
                "userRole",
                "designer"
            );

            alert("Designer login successful!");

            window.location.href = "designer.html";

            return;
        }


        /* =================================
           NORMAL STUDENT LOGIN
        ================================= */

        const accounts = JSON.parse(
            localStorage.getItem("accounts")
        ) || [];


        const account = accounts.find(function(user) {

            return (
                user.username === username &&
                user.password === password
            );

        });


        if (!account) {

            alert("Incorrect username or password.");

            return;
        }


        if (account.status === "pending") {

            alert(
                "Your account is still waiting for admin approval."
            );

            return;
        }


        if (account.status === "rejected") {

            alert(
                "Your registration was rejected by the admin."
            );

            return;
        }


        if (account.status === "approved") {

            localStorage.setItem(
                "loggedInUser",
                account.username
            );

            localStorage.setItem(
                "userRole",
                "student"
            );

            alert("Login successful!");

            window.location.href = "forum.html";

        }

    });
}

/* =========================================
   ADMIN DASHBOARD
========================================= */

function loadAdminDashboard() {

    const pendingContainer =
        document.getElementById("pendingAccounts");

    const approvedContainer =
        document.getElementById("approvedAccounts");

    const postsContainer =
        document.getElementById("adminPosts");


    if (!pendingContainer &&
        !approvedContainer &&
        !postsContainer) {
        return;
    }


    const accounts = JSON.parse(
        localStorage.getItem("accounts")
    ) || [];


    /* ---------- PENDING ---------- */

    if (pendingContainer) {

        pendingContainer.innerHTML = "";

        const pendingAccounts = accounts.filter(function(account) {
            return account.status === "pending";
        });


        if (pendingAccounts.length === 0) {

            pendingContainer.innerHTML =
                "<p>No pending registrations.</p>";

        } else {

            pendingAccounts.forEach(function(account) {

                const box = document.createElement("div");

                box.className = "admin-card";

                box.innerHTML = `
                    <h3>${account.fullname}</h3>

                    <p><strong>Student ID:</strong>
                    ${account.studentID}</p>

                    <p><strong>Section:</strong>
                    ${account.section}</p>

                    <p><strong>Email:</strong>
                    ${account.email}</p>

                    <p><strong>Username:</strong>
                    ${account.username}</p>

                    <img
                        src="${account.coe}"
                        alt="Certificate of Enrollment"
                        style="max-width:300px; width:100%;"
                    >

                    <br>

                    <button onclick="approveAccount('${account.username}')">
                        Approve
                    </button>

                    <button onclick="rejectAccount('${account.username}')">
                        Reject
                    </button>
                `;

                pendingContainer.appendChild(box);

            });
        }
    }


    /* ---------- APPROVED ---------- */

    if (approvedContainer) {

        approvedContainer.innerHTML = "";

        const approvedAccounts = accounts.filter(function(account) {
            return account.status === "approved";
        });


        if (approvedAccounts.length === 0) {

            approvedContainer.innerHTML =
                "<p>No approved accounts.</p>";

        } else {

            approvedAccounts.forEach(function(account) {

                const box = document.createElement("div");

                box.className = "admin-card";

                box.innerHTML = `
                    <h3>${account.fullname}</h3>

                    <p>Student ID:
                    ${account.studentID}</p>

                    <p>Section:
                    ${account.section}</p>

                    <p>Username:
                    ${account.username}</p>

                    <p>Points:
                    ${account.points || 0}</p>

                    <button onclick="deleteAccount('${account.username}')">
                        Delete Account
                    </button>
                `;

                approvedContainer.appendChild(box);

            });
        }
    }


    /* ---------- POSTS ---------- */

    if (postsContainer) {

        loadAdminPosts();

    }
}


/* =========================================
   APPROVE ACCOUNT
========================================= */

function approveAccount(username) {

    let accounts = JSON.parse(
        localStorage.getItem("accounts")
    ) || [];


    const account = accounts.find(function(user) {
        return user.username === username;
    });


    if (!account) {
        return;
    }


    account.status = "approved";


    localStorage.setItem(
        "accounts",
        JSON.stringify(accounts)
    );


    alert("Account approved!");

    loadAdminDashboard();
}


/* =========================================
   REJECT ACCOUNT
========================================= */

function rejectAccount(username) {

    let accounts = JSON.parse(
        localStorage.getItem("accounts")
    ) || [];


    const account = accounts.find(function(user) {
        return user.username === username;
    });


    if (!account) {
        return;
    }


    account.status = "rejected";


    localStorage.setItem(
        "accounts",
        JSON.stringify(accounts)
    );


    alert("Account rejected!");

    loadAdminDashboard();
}


/* =========================================
   DELETE ACCOUNT
========================================= */

function deleteAccount(username) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this account?"
    );


    if (!confirmDelete) {
        return;
    }


    let accounts = JSON.parse(
        localStorage.getItem("accounts")
    ) || [];


    accounts = accounts.filter(function(account) {
        return account.username !== username;
    });


    localStorage.setItem(
        "accounts",
        JSON.stringify(accounts)
    );


    /* Delete user's posts too */

    let posts = JSON.parse(
        localStorage.getItem("posts")
    ) || [];


    posts = posts.filter(function(post) {
        return post.username !== username;
    });


    localStorage.setItem(
        "posts",
        JSON.stringify(posts)
    );


    alert("Account deleted!");

    loadAdminDashboard();
}


/* =========================================
   FORUM
========================================= */

const postForm = document.getElementById("postForm");

if (postForm) {

    loadForum();


    postForm.addEventListener("submit", function(event) {

        event.preventDefault();


        const content =
            document.getElementById("postContent").value.trim();

        const anonymous =
            document.getElementById("anonymousPost").checked;


        if (!content) {
            return;
        }


        const username =
            localStorage.getItem("loggedInUser");


        if (!username) {

            alert("Please login first.");

            window.location.href = "login.html";

            return;
        }


        let posts = JSON.parse(
            localStorage.getItem("posts")
        ) || [];


        const newPost = {

            id: Date.now(),

            username: username,

            content: content,

            anonymous: anonymous,

            reactions: 0,

            points: 3,

            date: new Date().toLocaleString()

        };


        posts.push(newPost);


        localStorage.setItem(
            "posts",
            JSON.stringify(posts)
        );


        /* Give user 3 points */

        addPoints(username, 3);


        postForm.reset();

        loadForum();

    });
}


/* =========================================
   LOAD FORUM
========================================= */
          
function loadForum() {

    const container =
        document.getElementById("postContainer");

    if (!container) {
        return;
    }

    const posts =
        JSON.parse(
            localStorage.getItem("posts")
        ) || [];

    container.innerHTML = "";


    if (posts.length === 0) {

        container.innerHTML =
            "<p>No posts yet. Be the first to share something! 💬</p>";

        return;
    }


    posts.slice().reverse().forEach(
        function(post) {

            const postCard =
                document.createElement("div");

            postCard.className =
                "post";


            const author =
                post.anonymous
                ? "Anonymous"
                : post.username;


            postCard.innerHTML = `

                <div class="speech-bubble">

                    <strong>
                        ${author}
                    </strong>

                    <p>
                        ${post.content}
                    </p>

                </div>


                <div class="post-character">

    ${createCharacter(post.username)}

</div>


                <div class="post-actions">

                    <button
                        onclick="reactToPost(${post.id})"
                    >
                        ❤️ ${post.reactions || 0}
                    </button>

                    ${
                        post.username ===
                        localStorage.getItem("loggedInUser")
                        ?
                        `
                        <button
                            onclick="deletePost(${post.id})"
                        >
                            Delete
                        </button>
                        `
                        :
                        ""
                    }

                </div>

            `;


            container.appendChild(postCard);

        }
    );
}

/* =========================================
   REACT TO POST
========================================= */

function reactToPost(postID) {

    let posts = JSON.parse(
        localStorage.getItem("posts")
    ) || [];


    const post = posts.find(function(item) {
        return item.id === postID;
    });


    if (!post) {
        return;
    }


    post.reactions =
        (post.reactions || 0) + 1;


    localStorage.setItem(
        "posts",
        JSON.stringify(posts)
    );


    loadForum();
}


/* =========================================
   DELETE OWN POST
========================================= */

function deletePost(postID) {

    const username =
        localStorage.getItem("loggedInUser");


    let posts = JSON.parse(
        localStorage.getItem("posts")
    ) || [];


    const post = posts.find(function(item) {
        return item.id === postID;
    });


    if (!post) {
        return;
    }


    if (post.username !== username) {

        alert("You can only delete your own post.");

        return;
    }


    const confirmDelete = confirm(
        "Delete this post?"
    );


    if (!confirmDelete) {
        return;
    }


    posts = posts.filter(function(item) {
        return item.id !== postID;
    });


    localStorage.setItem(
        "posts",
        JSON.stringify(posts)
    );


    loadForum();
}


/* =========================================
   ADMIN POST MANAGEMENT
========================================= */

function loadAdminPosts() {

    const container =
        document.getElementById("adminPosts");


    if (!container) {
        return;
    }


    const posts = JSON.parse(
        localStorage.getItem("posts")
    ) || [];


    const accounts = JSON.parse(
        localStorage.getItem("accounts")
    ) || [];


    container.innerHTML = "";


    if (posts.length === 0) {

        container.innerHTML =
            "<p>No forum posts.</p>";

        return;
    }


    posts.slice().reverse().forEach(function(post) {

        const account = accounts.find(function(user) {
            return user.username === post.username;
        });


        const box =
            document.createElement("div");


        box.className = "admin-card";


        box.innerHTML = `

            <p>
                <strong>Post:</strong>
                ${post.content}
            </p>

            <p>
                <strong>Posted by:</strong>
                ${account ? account.fullname : post.username}
            </p>

            <p>
                <strong>Username:</strong>
                ${post.username}
            </p>

            <p>
                <strong>Anonymous:</strong>
                ${post.anonymous ? "Yes" : "No"}
            </p>

            <p>
                <strong>Reactions:</strong>
                ${post.reactions || 0}
            </p>

            <button onclick="adminDeletePost(${post.id})">
                Delete Post
            </button>

        `;


        container.appendChild(box);

    });
}


/* =========================================
   ADMIN DELETE POST
========================================= */

function adminDeletePost(postID) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this post?"
    );


    if (!confirmDelete) {
        return;
    }


    let posts = JSON.parse(
        localStorage.getItem("posts")
    ) || [];


    posts = posts.filter(function(post) {
        return post.id !== postID;
    });


    localStorage.setItem(
        "posts",
        JSON.stringify(posts)
    );


    loadAdminPosts();

    loadForum();
}


/* =========================================
   POINTS
========================================= */

function addPoints(username, amount) {

    let accounts = JSON.parse(
        localStorage.getItem("accounts")
    ) || [];


    const account = accounts.find(function(user) {
        return user.username === username;
    });


    if (!account) {
        return;
    }


    account.points =
        (account.points || 0) + amount;


    localStorage.setItem(
        "accounts",
        JSON.stringify(accounts)
    );
}


/* =========================================
   DISPLAY USER POINTS
========================================= */

function loadUserInfo() {

    const username =
        localStorage.getItem("loggedInUser");


    if (!username) {
        return;
    }


    const accounts = JSON.parse(
        localStorage.getItem("accounts")
    ) || [];


    const account = accounts.find(function(user) {
        return user.username === username;
    });


    if (!account) {
        return;
    }


    const currentUser =
        document.getElementById("currentUser");


    const userPoints =
        document.getElementById("userPoints");


    const shopPoints =
        document.getElementById("shopPoints");


    if (currentUser) {
        currentUser.textContent =
            account.fullname;
    }


    if (userPoints) {
        userPoints.textContent =
            account.points || 0;
    }


    if (shopPoints) {
        shopPoints.textContent =
            account.points || 0;
    }
}


/* =========================================
   CLEAR TEST DATA
========================================= */

const clearDataButton =
    document.getElementById("clearDataButton");


if (clearDataButton) {

    clearDataButton.addEventListener(
        "click",
        function() {

            const confirmClear = confirm(
                "This will delete ALL accounts and posts. Continue?"
            );


            if (!confirmClear) {
                return;
            }


            localStorage.removeItem("accounts");
            localStorage.removeItem("posts");
            localStorage.removeItem("loggedInUser");


            alert("All test data has been cleared!");


            loadAdminDashboard();

        }
    );
}


/* =========================================
   START FUNCTIONS
========================================= */

loadAdminDashboard();
loadUserInfo();

/* =========================================
   COSMETICS DESIGNER
========================================= */

const cosmeticForm =
    document.getElementById("cosmeticForm");


if (cosmeticForm) {

    loadDesignerCosmetics();


    cosmeticForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document.getElementById("cosmeticName")
                .value
                .trim();


            const category =
                document.getElementById("cosmeticCategory")
                .value;


            const price =
                Number(
                    document.getElementById("cosmeticPrice")
                    .value
                );


            const season =
                document.getElementById("cosmeticSeason")
                .value;


            const imageFile =
                document.getElementById("cosmeticImage")
                .files[0];


            if (!imageFile) {

                alert("Please select a cosmetic image.");

                return;
            }


            /* Make sure it is an image */

            if (imageFile.type !== "image/png") {
    alert("Please upload a PNG image only.");
    return;
            }


            const reader = new FileReader();


            reader.onload = function() {

                const cosmetic = {

                    id: Date.now(),

                    name: name,

                    category: category,

                    price: price,

                    season: season,

                    image: reader.result

                };


                let cosmetics =
                    JSON.parse(
                        localStorage.getItem("cosmetics")
                    ) || [];


                cosmetics.push(cosmetic);


                localStorage.setItem(
                    "cosmetics",
                    JSON.stringify(cosmetics)
                );


                alert(
                    "Cosmetic added successfully! 🎨"
                );


                cosmeticForm.reset();


                loadDesignerCosmetics();

            };


            reader.readAsDataURL(imageFile);

        }
    );
}


/* =========================================
   LOAD DESIGNER COSMETICS
========================================= */

function loadDesignerCosmetics() {

    const container =
        document.getElementById("designerCosmetics");


    if (!container) {
        return;
    }


    const cosmetics =
        JSON.parse(
            localStorage.getItem("cosmetics")
        ) || [];


    container.innerHTML = "";


    if (cosmetics.length === 0) {

        container.innerHTML =
            "<p>No cosmetics added yet.</p>";

        return;
    }


    cosmetics.slice().reverse().forEach(
        function(cosmetic) {

            const card =
                document.createElement("div");


            card.className = "admin-card";


            card.innerHTML = `

                <h3>${cosmetic.name}</h3>

                <p>
                    <strong>Category:</strong>
                    ${cosmetic.category}
                </p>

                <p>
                    <strong>Price:</strong>
                    ${cosmetic.price} points
                </p>

                <p>
                    <strong>Season:</strong>
                    ${cosmetic.season}
                </p>

                <img
                    src="${cosmetic.image}"
                    alt="${cosmetic.name}"
                    style="
                        width:150px;
                        height:200px;
                        object-fit:contain;
                    "
                >

                <br>

                <button
                    onclick="deleteCosmetic(${cosmetic.id})"
                >
                    Delete Cosmetic
                </button>

            `;


            container.appendChild(card);

        }
    );
}


/* =========================================
   DELETE COSMETIC
========================================= */

function deleteCosmetic(cosmeticID) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this cosmetic?"
        );


    if (!confirmDelete) {
        return;
    }


    let cosmetics =
        JSON.parse(
            localStorage.getItem("cosmetics")
        ) || [];


    cosmetics =
        cosmetics.filter(
            function(cosmetic) {

                return cosmetic.id !== cosmeticID;

            }
        );


    localStorage.setItem(
        "cosmetics",
        JSON.stringify(cosmetics)
    );


    alert("Cosmetic deleted!");


    loadDesignerCosmetics();

}

/* =========================================
   LOAD COSMETICS SHOP
========================================= */

const cosmeticsContainer =
    document.getElementById("cosmeticsContainer");

const categoryButtons =
    document.querySelectorAll(".category-button");


if (cosmeticsContainer) {

    loadShopCosmetics("hats");


    categoryButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const category =
                        button.dataset.category;

                    loadShopCosmetics(category);

                }
            );

        }
    );
}


/* =========================================
   DISPLAY SHOP COSMETICS
========================================= */

function loadShopCosmetics(category) {

    const container =
        document.getElementById("cosmeticsContainer");

    const title =
        document.getElementById("categoryTitle");

    if (!container) {
        return;
    }

    const cosmetics =
        JSON.parse(
            localStorage.getItem("cosmetics")
        ) || [];

    container.innerHTML = "";


    /* Category title */

    if (title) {

        if (category === "face") {

            title.textContent = "Face Cosmetics";

        } else {

            title.textContent =
                category.charAt(0).toUpperCase()
                + category.slice(1)
                + " Cosmetics";

        }
    }


    /* Face has multiple categories */

    let filteredCosmetics;


    if (category === "face") {

        const faceCategories = [
            "eyes",
            "mouth",
            "nose",
            "ears",
            "eyebrows",
            "eyelashes",
            "skin"
        ];


        filteredCosmetics =
            cosmetics.filter(function(cosmetic) {

                return faceCategories.includes(
                    cosmetic.category
                );

            });

    } else {

        filteredCosmetics =
            cosmetics.filter(function(cosmetic) {

                return cosmetic.category === category;

            });
    }


    /* No cosmetics */

    if (filteredCosmetics.length === 0) {

        container.innerHTML =
            "<p>No cosmetics available in this category yet.</p>";

        return;
    }


    /* Display cosmetics */

    filteredCosmetics.forEach(function(cosmetic) {

        const card =
            document.createElement("div");

        card.className = "cosmetic-card";


        /* Different button for themes */

        let buttonHTML;


        if (cosmetic.category === "themes") {

            buttonHTML = `
                <button
                    onclick="buyTheme(${cosmetic.id})"
                >
                    Buy Theme
                </button>
            `;

        } else {

            buttonHTML = `
                <button
                    onclick="buyCosmetic(${cosmetic.id})"
                >
                    Buy
                </button>
            `;

        }


        card.innerHTML = `

            <img
                src="${cosmetic.image}"
                alt="${cosmetic.name}"
            >

            <h3>
                ${cosmetic.name}
            </h3>

            <p>
                ${cosmetic.price} points
            </p>

            <p>
                ${cosmetic.season}
            </p>

            ${buttonHTML}

        `;


        container.appendChild(card);

    });

}
    
/* =========================================
   BUY COSMETIC
========================================= */

function buyCosmetic(cosmeticID) {

    const username =
        localStorage.getItem("loggedInUser");


    if (!username) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }


    /* Get cosmetics */

    const cosmetics =
        JSON.parse(
            localStorage.getItem("cosmetics")
        ) || [];


    const cosmetic =
        cosmetics.find(
            function(item) {

                return item.id === cosmeticID;

            }
        );


    if (!cosmetic) {

        alert("Cosmetic not found.");

        return;
    }


    /* Get accounts */

    let accounts =
        JSON.parse(
            localStorage.getItem("accounts")
        ) || [];


    const account =
        accounts.find(
            function(user) {

                return user.username === username;

            }
        );


    if (!account) {

        alert("Account not found.");

        return;
    }


    /* Create inventory if it doesn't exist */

    if (!account.inventory) {

        account.inventory = [];

    }


    /* Check if already owned */

    const alreadyOwned =
        account.inventory.some(
            function(item) {

                return item === cosmeticID;

            }
        );


    if (alreadyOwned) {

        alert("You already own this cosmetic!");

        return;
    }


    /* Check points */

    const points =
        account.points || 0;


    if (points < cosmetic.price) {

        alert(
            "You don't have enough points!"
        );

        return;
    }


    /* Confirm purchase */

    const confirmPurchase =
        confirm(
            "Buy " +
            cosmetic.name +
            " for " +
            cosmetic.price +
            " points?"
        );


    if (!confirmPurchase) {

        return;
    }


    /* Deduct points */

    account.points =
        points - cosmetic.price;


    /* Add cosmetic to inventory */

    account.inventory.push(
        cosmeticID
    );


    /* Save account */

    localStorage.setItem(
        "accounts",
        JSON.stringify(accounts)
    );


    alert(
        cosmetic.name +
        " added to your inventory! 🎉"
    );


    /* Refresh points */

    loadUserInfo();


    /* Refresh shop */

    loadShopCosmetics(
        cosmetic.category === "eyes" ||
        cosmetic.category === "mouth" ||
        cosmetic.category === "nose" ||
        cosmetic.category === "ears" ||
        cosmetic.category === "eyebrows" ||
        cosmetic.category === "eyelashes" ||
        cosmetic.category === "skin"
            ? "face"
            : cosmetic.category
    );

}

/* =========================================
   CHARACTER EQUIPMENT
========================================= */

function loadCharacter() {

    const layersContainer =
        document.getElementById("characterLayers");

    if (!layersContainer) {
        return;
    }

    const username =
        localStorage.getItem("loggedInUser");

    if (!username) {
        return;
    }

    const accounts =
        JSON.parse(
            localStorage.getItem("accounts")
        ) || [];

    const account =
        accounts.find(function(user) {
            return user.username === username;
        });

    if (!account) {
        return;
    }

    const cosmetics =
        JSON.parse(
            localStorage.getItem("cosmetics")
        ) || [];

    layersContainer.innerHTML = "";


    /* ==============================
       EQUIPPED COSMETICS
    ============================== */

    if (!account.equipped) {
        return;
    }


    Object.keys(account.equipped).forEach(
        function(category) {

            const cosmeticID =
                account.equipped[category];

            const cosmetic =
                cosmetics.find(
                    function(item) {
                        return item.id === cosmeticID;
                    }
                );

            if (!cosmetic) {
                return;
            }


            const layer =
                document.createElement("div");

            layer.className =
                "character-layer layer-" +
                category;

            layer.style.backgroundImage =
                "url('" +
                cosmetic.image +
                "')";


            layersContainer.appendChild(layer);

        }
    );

}

/* =========================================
   EQUIP COSMETIC
========================================= */

function equipCosmetic(cosmeticID) {

    const username =
        localStorage.getItem("loggedInUser");


    if (!username) {
        alert("Please login first.");
        return;
    }


    let accounts =
        JSON.parse(
            localStorage.getItem("accounts")
        ) || [];


    const account =
        accounts.find(function(user) {

            return user.username === username;

        });


    if (!account) {
        return;
    }


    /* Check inventory */

    if (!account.inventory) {
        account.inventory = [];
    }


    const owned =
        account.inventory.some(function(id) {

            return id === cosmeticID;

        });


    if (!owned) {

        alert("You don't own this cosmetic.");

        return;
    }


    /* Get cosmetic */

    const cosmetics =
        JSON.parse(
            localStorage.getItem("cosmetics")
        ) || [];


    const cosmetic =
        cosmetics.find(function(item) {

            return item.id === cosmeticID;

        });


    if (!cosmetic) {
        return;
    }


    /* Create equipped object */

    if (!account.equipped) {

        account.equipped = {};

    }


    /*
       One cosmetic per category.

       Example:
       hats = Blue Cap
       eyes = Happy Eyes
       tops = Blue Shirt
    */

    account.equipped[cosmetic.category] =
        cosmeticID;


    localStorage.setItem(
        "accounts",
        JSON.stringify(accounts)
    );


    alert(
        cosmetic.name +
        " equipped! 🎨"
    );

loadCharacter();
loadInventory();
loadUserInfo();

}

/* =========================================
   LOAD INVENTORY
========================================= */

function loadInventory() {

    const container =
        document.getElementById("equippedItems");

    if (!container) {
        return;
    }

    const username =
        localStorage.getItem("loggedInUser");

    if (!username) {
        return;
    }

    const accounts =
        JSON.parse(
            localStorage.getItem("accounts")
        ) || [];

    const account =
        accounts.find(function(user) {
            return user.username === username;
        });

    if (!account) {
        return;
    }

    const cosmetics =
        JSON.parse(
            localStorage.getItem("cosmetics")
        ) || [];

    container.innerHTML = "";

    if (
        !account.inventory ||
        account.inventory.length === 0
    ) {
        container.innerHTML =
            "<p>You don't own any cosmetics yet.</p>";
        return;
    }

    account.inventory.forEach(
        function(cosmeticID) {

            const cosmetic =
                cosmetics.find(
                    function(item) {
                        return item.id === cosmeticID;
                    }
                );

            if (!cosmetic) {
                return;
            }

            const card =
                document.createElement("div");

            card.className = "cosmetic-card";


            /* ==============================
               THEME
            ============================== */

            if (cosmetic.category === "themes") {

                const isEquipped =
                    account.equippedTheme === cosmetic.id;

                card.innerHTML = `

                    <img
                        src="${cosmetic.image}"
                        alt="${cosmetic.name}"
                    >

                    <h3>
                        ${cosmetic.name}
                    </h3>

                    <p>
                        🌎 Theme
                    </p>

                    ${
                        isEquipped
                        ?
                        `<strong>🌎 Equipped</strong>`
                        :
                        `<button
                            onclick="equipTheme(${cosmetic.id})"
                        >
                            Equip Theme
                        </button>`
                    }

                `;

            }


            /* ==============================
               CHARACTER COSMETIC
            ============================== */

            else {

                const isEquipped =
                    account.equipped &&
                    account.equipped[cosmetic.category]
                    === cosmetic.id;

                card.innerHTML = `

                    <img
                        src="${cosmetic.image}"
                        alt="${cosmetic.name}"
                    >

                    <h3>
                        ${cosmetic.name}
                    </h3>

                    <p>
                        ${cosmetic.category}
                    </p>

                    ${
                        isEquipped
                        ?
                        `<strong>✅ Equipped</strong>`
                        :
                        `<button
                            onclick="equipCosmetic(${cosmetic.id})"
                        >
                            Equip
                        </button>`
                    }

                `;

            }


            container.appendChild(card);

        }
    );
}

/* =========================================
   EQUIP THEME
========================================= */

function equipTheme(themeID) {

    const username =
        localStorage.getItem("loggedInUser");


    if (!username) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }


    let accounts =
        JSON.parse(
            localStorage.getItem("accounts")
        ) || [];


    const account =
        accounts.find(function(user) {

            return user.username === username;

        });


    if (!account) {
        return;
    }


    /* Check if theme is owned */

    if (!account.inventory) {
        account.inventory = [];
    }


    const owned =
        account.inventory.some(function(id) {

            return id === themeID;

        });


    if (!owned) {

        alert("You don't own this theme.");

        return;
    }


    /* Get theme */

    const cosmetics =
        JSON.parse(
            localStorage.getItem("cosmetics")
        ) || [];


    const theme =
        cosmetics.find(function(item) {

            return item.id === themeID &&
                   item.category === "themes";

        });


    if (!theme) {
        return;
    }


    /* Save equipped theme */

    account.equippedTheme =
        themeID;


    localStorage.setItem(
        "accounts",
        JSON.stringify(accounts)
    );


    alert(
        theme.name +
        " equipped! 🌎"
    );


    loadCharacterTheme();

}

/* =========================================
   LOAD CHARACTER THEME
========================================= */

function loadCharacterTheme() {

    const characterArea =
        document.querySelector(".character-area");

    if (!characterArea) {
        return;
    }

    const username =
        localStorage.getItem("loggedInUser");

    if (!username) {
        return;
    }

    const accounts =
        JSON.parse(
            localStorage.getItem("accounts")
        ) || [];

    const account =
        accounts.find(function(user) {
            return user.username === username;
        });

    if (!account) {
        return;
    }

    const cosmetics =
        JSON.parse(
            localStorage.getItem("cosmetics")
        ) || [];


    /* ==============================
       NO THEME EQUIPPED
    ============================== */

    if (!account.equippedTheme) {

        characterArea.style.backgroundImage =
            "none";

        return;
    }


    /* ==============================
       FIND EQUIPPED THEME
    ============================== */

    const theme =
        cosmetics.find(function(item) {

            return (
                item.id === account.equippedTheme &&
                item.category === "themes"
            );

        });


    if (!theme) {
        return;
    }


    /* ==============================
       APPLY THEME
    ============================== */

    characterArea.style.backgroundImage =
        "url('" + theme.image + "')";
}

/* =========================================
   BUY THEME
========================================= */

function buyTheme(themeID) {

    const username =
        localStorage.getItem("loggedInUser");


    if (!username) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }


    let accounts =
        JSON.parse(
            localStorage.getItem("accounts")
        ) || [];


    const account =
        accounts.find(function(user) {

            return user.username === username;

        });


    if (!account) {
        return;
    }


    const cosmetics =
        JSON.parse(
            localStorage.getItem("cosmetics")
        ) || [];


    const theme =
        cosmetics.find(function(item) {

            return (
                item.id === themeID &&
                item.category === "themes"
            );

        });


    if (!theme) {

        alert("Theme not found.");

        return;
    }


    if (!account.inventory) {

        account.inventory = [];

    }


    /* Already owned */

    if (
        account.inventory.includes(themeID)
    ) {

        alert("You already own this theme!");

        return;
    }


    /* Not enough points */

    if (
        (account.points || 0) < theme.price
    ) {

        alert("You don't have enough points!");

        return;
    }


    /* Confirm */

    const confirmed =
        confirm(
            "Buy " +
            theme.name +
            " for " +
            theme.price +
            " points?"
        );


    if (!confirmed) {
        return;
    }


    /* Deduct points */

    account.points =
        (account.points || 0) - theme.price;


    /* Add to inventory */

    account.inventory.push(themeID);


    localStorage.setItem(
        "accounts",
        JSON.stringify(accounts)
    );


    alert(
        theme.name +
        " added to your inventory! 🌎"
    );


    loadUserInfo();

    loadInventory();

}

/* =========================================
   LOGOUT
========================================= */

function logoutUser() {

    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userRole");

    alert("You have been logged out.");

    window.location.href = "index.html";
}

/* =========================================
   CHARACTER RENDERER
========================================= */

function createCharacter(username) {

    const accounts =
        JSON.parse(
            localStorage.getItem("accounts")
        ) || [];

    const account =
        accounts.find(function(user) {
            return user.username === username;
        });

    if (!account) {
        return "";
    }

    const cosmetics =
        JSON.parse(
            localStorage.getItem("cosmetics")
        ) || [];

    let layersHTML = "";


    /* ==============================
       EQUIPPED CHARACTER COSMETICS
    ============================== */

    if (account.equipped) {

        Object.keys(account.equipped).forEach(
            function(category) {

                const cosmeticID =
                    account.equipped[category];

                const cosmetic =
                    cosmetics.find(
                        function(item) {
                            return item.id === cosmeticID;
                        }
                    );

                if (!cosmetic) {
                    return;
                }

                layersHTML += `
                   <div                        class="character-layer layer-${category}"                        style="background-image: url('${cosmetic.image}');"                    ></div>

                `;

            }
        );

    }


    /* ==============================
       CHARACTER HTML
    ============================== */

    return `
       <div class="forum-character">

            <div class="forum-character-body">

                <div
                    class="character-layer character-base"
                ></div>

                ${layersHTML}

            </div>
        </div>

    `;
}


/* =========================================
   START FUNCTIONS
========================================= */

loadAdminDashboard();
loadUserInfo();
loadCharacter();
loadInventory();
loadCharacterTheme();