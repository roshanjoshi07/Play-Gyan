```javascript
/* =====================================================
   SUPABASE CONFIGURATION
===================================================== */

/*
   Supabase Dashboard बाट यी दुई value copy गर्नुहोस्.

   Project URL example:
   https://xxxxxxxx.supabase.co

   Publishable/anon key:
   eyJ...
*/

const SUPABASE_URL =
    "YOUR_SUPABASE_PROJECT_URL";

const SUPABASE_KEY =
    "YOUR_SUPABASE_PUBLISHABLE_KEY";


/*
   Supabase project ID.

   Example:
   https://abcdefghijk.supabase.co

   यहाँ "abcdefghijk" राख्नुहोस्.
*/

const SUPABASE_PROJECT_ID =
    "YOUR_PROJECT_ID";


/*
   Storage bucket name
*/

const BUCKET =
    "movies";


/*
   Maximum file size used by this website.

   5 GB example.
   Actual Supabase plan/bucket limit must also
   allow the file.
*/

const MAX_FILE_SIZE =
    5 * 1024 * 1024 * 1024;


/*
   YOUR ADMIN UID

   पछि Supabase Authentication बाट
   आफ्नो User UID राख्नुहोस्.

   अहिले temporary placeholder.
*/

const ADMIN_UID =
    "YOUR_SUPABASE_ADMIN_UID";


/* =====================================================
   SUPABASE CLIENT
===================================================== */

const {
    createClient
} = supabase;


const db =
    createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   ELEMENTS
===================================================== */

const uploadArea =
    document.getElementById(
        "uploadArea"
    );

const uploadBtn =
    document.getElementById(
        "uploadBtn"
    );

const videoFile =
    document.getElementById(
        "videoFile"
    );

const videoTitle =
    document.getElementById(
        "videoTitle"
    );

const posterUrl =
    document.getElementById(
        "posterUrl"
    );

const progressBar =
    document.getElementById(
        "progressBar"
    );

const uploadStatus =
    document.getElementById(
        "uploadStatus"
    );

const movieGrid =
    document.getElementById(
        "movieGrid"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const loginStatus =
    document.getElementById(
        "loginStatus"
    );


/* =====================================================
   HELPERS
===================================================== */

function escapeHTML(value){

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(value ?? "");

    return div.innerHTML;
}


function formatBytes(bytes){

    if(!bytes){
        return "0 MB";
    }

    const units =
        [
            "Bytes",
            "KB",
            "MB",
            "GB",
            "TB"
        ];

    const i =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );

    return (
        bytes /
        Math.pow(1024,i)
    ).toFixed(2)
    + " "
    + units[i];
}


function safeFileName(name){

    return name
        .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        )
        .replace(
            /_+/g,
            "_"
        );
}


/* =====================================================
   AUTH
===================================================== */

async function updateAuthUI(){

    const {
        data,
        error
    } =
    await db.auth.getUser();


    if(error){

        console.error(error);

        return;
    }


    const user =
        data.user;


    if(
        user &&
        user.id === ADMIN_UID
    ){

        uploadArea.classList.add(
            "show"
        );

        loginStatus.textContent =
            "Admin logged in";

        loginStatus.style.color =
            "#48d597";

    }else{

        uploadArea.classList.remove(
            "show"
        );

        if(user){

            loginStatus.textContent =
                "Logged in, but not admin";

        }else{

            loginStatus.textContent =
                "Not logged in";
        }

        loginStatus.style.color =
            "#aaa";
    }
}


/* =====================================================
   LOGIN
===================================================== */

document
.getElementById(
    "loginBtn"
)
.addEventListener(
    "click",
    async function(){

        const email =
            document
            .getElementById(
                "adminEmail"
            )
            .value
            .trim();


        const password =
            document
            .getElementById(
                "adminPassword"
            )
            .value;


        if(
            !email ||
            !password
        ){

            alert(
                "Enter email and password."
            );

            return;
        }


        const {
            error
        } =
        await db.auth.signInWithPassword(
            {
                email,
                password
            }
        );


        if(error){

            console.error(error);

            alert(
                error.message
            );

            return;
        }


        alert(
            "Login successful."
        );


        await updateAuthUI();
        await loadMovies();
    }
);


/* =====================================================
   LOGOUT
===================================================== */

document
.getElementById(
    "logoutBtn"
)
.addEventListener(
    "click",
    async function(){

        const {
            error
        } =
        await db.auth.signOut();


        if(error){

            console.error(error);

            return;
        }


        await updateAuthUI();
        await loadMovies();

        alert(
            "Logged out."
        );
    }
);


/* =====================================================
   AUTH STATE
===================================================== */

db.auth.onAuthStateChange(
    async function(){

        await updateAuthUI();

        await loadMovies();
    }
);


/* =====================================================
   TUS LARGE FILE UPLOAD
===================================================== */

async function uploadLargeVideo(
    file,
    path
){

    const {
        data,
        error
    } =
    await db.auth.getSession();


    if(error){
        throw error;
    }


    if(
        !data.session
    ){

        throw new Error(
            "Please login first."
        );
    }


    const accessToken =
        data.session.access_token;


    const endpoint =
        `https://${SUPABASE_PROJECT_ID}.storage.supabase.co/storage/v1/upload/resumable`;


    return new Promise(
    function(resolve,reject){

        const upload =
            new tus.Upload(
                file,
                {

                    endpoint:
                        endpoint,

                    retryDelays:
                        [
                            0,
                            3000,
                            5000,
                            10000,
                            20000
                        ],

                    headers:
                        {
                            authorization:
                                `Bearer ${accessToken}`,

                            apikey:
                                SUPABASE_KEY,

                            "x-upsert":
                                "false"
                        },

                    uploadDataDuringCreation:
                        true,

                    removeFingerprintOnSuccess:
                        true,

                    /*
                       Supabase currently recommends
                       6 MB chunks for TUS uploads.
                    */

                    chunkSize:
                        6 * 1024 * 1024,

                    metadata:
                        {
                            bucketName:
                                BUCKET,

                            objectName:
                                path,

                            contentType:
                                file.type ||
                                "video/mp4",

                            cacheControl:
                                "3600"
                        },

                    onError:
                        function(error){

                            console.error(
                                "TUS upload error:",
                                error
                            );

                            reject(
                                error
                            );
                        },

                    onProgress:
                        function(
                            bytesUploaded,
                            bytesTotal
                        ){

                            const percent =
                                (
                                    bytesUploaded /
                                    bytesTotal
                                ) * 100;


                            progressBar.style.width =
                                percent.toFixed(2)
                                + "%";


                            uploadStatus.textContent =
                                "Uploading "
                                + percent.toFixed(1)
                                + "% — "
                                + formatBytes(
                                    bytesUploaded
                                )
                                + " / "
                                + formatBytes(
                                    bytesTotal
                                );
                        },

                    onSuccess:
                        function(){

                            resolve(
                                upload.url
                            );
                        }
                }
            );


        upload.start();

    });
}


/* =====================================================
   UPLOAD VIDEO
===================================================== */

uploadBtn.addEventListener(
    "click",
    async function(){

        try{

            const {
                data
            } =
            await db.auth.getUser();


            const user =
                data.user;


            if(
                !user ||
                user.id !== ADMIN_UID
            ){

                alert(
                    "Only admin can upload."
                );

                return;
            }


            const file =
                videoFile.files[0];


            if(!file){

                alert(
                    "Select a video first."
                );

                return;
            }


            if(
                file.size >
                MAX_FILE_SIZE
            ){

                alert(
                    "File is larger than the website limit of 5 GB."
                );

                return;
            }


            if(
                !file.type.startsWith(
                    "video/"
                )
            ){

                alert(
                    "Please select a video file."
                );

                return;
            }


            const title =
                videoTitle.value.trim();


            if(!title){

                alert(
                    "Enter video title."
                );

                videoTitle.focus();

                return;
            }


            uploadBtn.disabled =
                true;

            uploadBtn.textContent =
                "Uploading...";


            progressBar.style.width =
                "0%";


            uploadStatus.textContent =
                "Preparing upload...";


            /*
               Unique file name.

               This prevents accidental overwriting.
            */

            const uniqueId =
                crypto.randomUUID();


            const cleanName =
                safeFileName(
                    file.name
                );


            const path =
                `videos/${uniqueId}-${cleanName}`;


            /*
               Start resumable upload.
            */

            await uploadLargeVideo(
                file,
                path
            );


            uploadStatus.textContent =
                "Saving video information...";


            /*
               Public URL.

               This works when the "movies"
               bucket is PUBLIC.
            */

            const {
                data:
                    publicData
            } =
            db.storage
            .from(BUCKET)
            .getPublicUrl(
                path
            );


            const publicUrl =
                publicData.publicUrl;


            /*
               Save metadata in Postgres table.
            */

            const {
                error
            } =
            await db
            .from(
                "movies"
            )
            .insert(
                {

                    title:
                        title,

                    video_url:
                        publicUrl,

                    storage_path:
                        path,

                    poster_url:
                        posterUrl.value.trim()
                        || null,

                    file_name:
                        file.name,

                    file_size:
                        file.size,

                    mime_type:
                        file.type,

                    uploaded_by:
                        user.id
                }
            );


            if(error){

                console.error(
                    error
                );

                alert(
                    "Video uploaded, but database save failed."
                );

                return;
            }


            alert(
                "Video uploaded successfully! 🎉"
            );


            /*
               Reset form.
            */

            videoFile.value =
                "";

            videoTitle.value =
                "";

            posterUrl.value =
                "";

            progressBar.style.width =
                "0%";

            uploadStatus.textContent =
                "Ready";


            await loadMovies();

        }
        catch(error){

            console.error(
                error
            );

            alert(
                "Upload failed: "
                + error.message
            );

            uploadStatus.textContent =
                "Upload failed.";
        }
        finally{

            uploadBtn.disabled =
                false;

            uploadBtn.textContent =
                "⬆ Start Upload";
        }

    }
);


/* =====================================================
   LOAD MOVIES
===================================================== */

async function loadMovies(){

    movieGrid.innerHTML =
        `<div class="loading">
            Loading videos...
        </div>`;


    const {
        data,
        error
    } =
    await db
    .from(
        "movies"
    )
    .select("*")
    .order(
        "created_at",
        {
            ascending:false
        }
    );


    if(error){

        console.error(
            error
        );

        movieGrid.innerHTML =
            `<div class="empty">
                Unable to load videos.
            </div>`;

        return;
    }


    movieGrid.innerHTML =
        "";


    if(
        !data ||
        data.length === 0
    ){

        movieGrid.innerHTML =
            `<div class="empty">
                🎬 No videos uploaded yet.
            </div>`;

        return;
    }


    data.forEach(
        function(movie){

            createMovieCard(
                movie
            );
        }
    );
}


/* =====================================================
   CREATE MOVIE CARD
===================================================== */

function createMovieCard(
    movie
){

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "movie-card";


    const poster =
        movie.poster_url
        ?

        `<img
            src="${escapeHTML(
                movie.poster_url
            )}"
            alt="${escapeHTML(
                movie.title
            )}"
        >`

        :

        `<span
            style="
            font-size:60px;
            "
        >
            🎬
        </span>`;


    card.innerHTML = `

        <div class="movie-poster">

            ${poster}

        </div>


        <div class="movie-info">

            <h3>
                ${escapeHTML(
                    movie.title
                )}
            </h3>

            <p>
                ${formatBytes(
                    movie.file_size
                )}
            </p>


            <div class="movie-buttons">

                <button
                    class="watch-btn"
                >
                    ▶ Watch
                </button>


                <button
                    class="open-btn"
                >
                    ↗ Open
                </button>

            </div>


            <button
                class="delete-btn"
                style="display:none"
            >
                🗑 Delete
            </button>

        </div>
    `;


    /*
       Watch
    */

    card
    .querySelector(
        ".watch-btn"
    )
    .addEventListener(
        "click",
        function(){

            openVideo(
                movie.video_url
            );
        }
    );


    /*
       Open
    */

    card
    .querySelector(
        ".open-btn"
    )
    .addEventListener(
        "click",
        function(){

            window.open(
                movie.video_url,
                "_blank",
                "noopener"
            );
        }
    );


    /*
       Delete
    */

    const deleteButton =
        card.querySelector(
            ".delete-btn"
        );


    if(
        window.currentAdmin === true
    ){

        deleteButton.style.display =
            "block";
    }


    deleteButton.addEventListener(
        "click",
        function(){

            deleteMovie(
                movie
            );
        }
    );


    movieGrid.appendChild(
        card
    );
}


/* =====================================================
   DELETE MOVIE
===================================================== */

async function deleteMovie(
    movie
){

    const {
        data
    } =
    await db.auth.getUser();


    const user =
        data.user;


    if(
        !user ||
        user.id !== ADMIN_UID
    ){

        alert(
            "Only admin can delete."
        );

        return;
    }


    const ok =
        confirm(
            "Delete this video?"
        );


    if(!ok){
        return;
    }


    try{

        /*
           First delete database record.
        */

        const {
            error:
                databaseError
        } =
        await db
        .from(
            "movies"
        )
        .delete()
        .eq(
            "id",
            movie.id
        );


        if(databaseError){

            throw databaseError;
        }


        /*
           Then delete actual storage file.
        */

        if(
            movie.storage_path
        ){

            const {
                error:
                    storageError
            } =
            await db
            .storage
            .from(
                BUCKET
            )
            .remove(
                [
                    movie.storage_path
                ]
            );


            if(storageError){

                console.error(
                    storageError
                );
            }
        }


        alert(
            "Movie deleted."
        );


        loadMovies();

    }
    catch(error){

        console.error(
            error
        );

        alert(
            "Delete failed: "
            + error.message
        );
    }
}


/* =====================================================
   SEARCH
===================================================== */

searchInput.addEventListener(
    "input",
    function(){

        const search =
            this.value
            .toLowerCase()
            .trim();


        document
        .querySelectorAll(
            ".movie-card"
        )
        .forEach(
            function(card){

                const title =
                    card
                    .querySelector(
                        "h3"
                    )
                    .textContent
                    .toLowerCase();


                card.style.display =
                    title.includes(
                        search
                    )
                    ? ""
                    : "none";
            }
        );
    }
);


/* =====================================================
   VIDEO PLAYER
===================================================== */

function openVideo(
    url
){

    const modal =
        document.getElementById(
            "videoModal"
        );

    const player =
        document.getElementById(
            "videoPlayer"
        );


    player.src =
        url;


    modal.classList.add(
        "show"
    );


    player
    .play()
    .catch(
        function(){}
    );
}


document
.getElementById(
    "closeVideo"
)
.addEventListener(
    "click",
    closeVideo
);


document
.getElementById(
    "videoModal"
)
.addEventListener(
    "click",
    function(event){

        if(
            event.target ===
            this
        ){

            closeVideo();
        }
    }
);


function closeVideo(){

    const modal =
        document.getElementById(
            "videoModal"
        );

    const player =
        document.getElementById(
            "videoPlayer"
        );


    player.pause();

    player.removeAttribute(
        "src"
    );

    player.load();

    modal.classList.remove(
        "show"
    );
}


document.addEventListener(
    "keydown",
    function(event){

        if(
            event.key ===
            "Escape"
        ){

            closeVideo();
        }
    }
);


/* =====================================================
   INITIALIZE
===================================================== */

window.currentAdmin =
    false;


async function initialize(){

    const {
        data
    } =
    await db.auth.getUser();


    window.currentAdmin =
        Boolean(
            data.user &&
            data.user.id === ADMIN_UID
        );


    await updateAuthUI();

    await loadMovies();
}


initialize();
```
