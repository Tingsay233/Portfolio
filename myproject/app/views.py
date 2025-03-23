from http.client import HTTPResponse
from http.client import HTTPResponse

from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpRequest
from django.template import RequestContext
from datetime import datetime
from .forms import SignUpForm
from django.contrib.auth import authenticate, login
from .forms import RegisterAsArtist
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.contrib.auth.models import User
from .models import Artist
from django.contrib import messages
from django.http import HttpResponse
from .forms import UploadMusicForm
from .models import UploadedMusic
from .forms import BugReportForm
from .models import BugReport, Comment
from .forms import CommentForm
from .forms import ChangeUsernameForm, CustomPasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from .forms import ShareMusicForm
from .models import SharedMusic, Playlist
from .forms import AddToPlaylistForm, PlaylistForm

def home(request):
    """Renders the home page."""
    assert isinstance(request, HttpRequest)
    if request.user.is_authenticated:
        return(redirect('/profile'))
    else:
        return render(
            request,
            'app/index.html',
            {
                'title':'Home Page',
                'year': datetime.now().year,
            }
        )

def contact(request):
    """Renders the contact page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/contact.html',
        {
            'title':'Contact',
            'message':'Hiew Wei Cheng',
            'year':datetime.now().year,
        }
    )

def about(request):
    """Renders the about page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/about.html',
        {
            'title':'Music Sharing App',
            'message':'This application processes ...',
            'year':datetime.now().year,
        }
    )


def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = SignUpForm()
    return render(request, 'app/signup.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                # Redirect the user to the appropriate page based on their user type
                if user.user_type == 'customer':
                    return redirect('customer_dashboard')
                elif user.user_type == 'admin':
                    return redirect('admin_dashboard')
            else:
                # Handle invalid credentials
                error_message = 'Invalid username or password'
                return render(request, 'login.html', {'form': form, 'error_message': error_message})
    else:
        form = SignUpForm()

    return render(request, 'login.html', {'form': form, 'error_message': None})

def Profile(request):
    return render(request, 'app/profile.html')  # Ensure you have profile.html in templates


@login_required(login_url='denied')
def registerArtist(request):
    if request.method == 'POST':
        form = RegisterAsArtist(request.POST)
        if form.is_valid():
            Artist = form.save(commit=True)
            return render(request, 'app/success.html')
    else:
        form = RegisterAsArtist()

    return render(request, 'app/registerArtist.html', {'form': form})

@login_required
def menu(request):
    check_employee = request.user.groups.filter(name='employee').exists()

    context = {
            'title':'Main Menu',
            'is_employee': check_employee,
            'year':datetime.now().year,
        }
    context['user'] = request.user

    return render(request,'app/menu.html',context)


def denied(request):
    return render(request, 'app/denied.html')

def password_changed_done(request):
    return render(request, 'app/password_changed_done.html')


@login_required(login_url='denied')
def upload_music(request):
    if request.method == 'POST':
        form = UploadMusicForm(request.POST, request.FILES or None)
        if form.is_valid():
            form.save()
            return render(request, 'app/upload_success.html')
    else:
        form = UploadMusicForm()
    return render(request, 'app/upload.html', {'form': form})


def music_list(request):
    music_files = UploadedMusic.objects.all()
    return render(request, 'app/music_list.html', {'music_files': music_files})

@login_required
def change_username(request):
    if request.method == 'POST':
        form = ChangeUsernameForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your username has been updated successfully!')
            return redirect('profile')  # Redirect to profile page
    else:
        form = ChangeUsernameForm(instance=request.user)
    
    return render(request, 'app/change_username.html', {'form': form})

@login_required
def change_password(request):
    if request.method == 'POST':
        form = CustomPasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            update_session_auth_hash(request, request.user)  # Keep the user logged in
            return redirect('password_changed_done')
    else:
        form = CustomPasswordChangeForm(user=request.user)

    return render(request, 'app/change_password.html', {'form': form})


@login_required(login_url = 'denied')
def bug_report(request):
    if request.method =='POST':
        form = BugReportForm(request.POST)
        if form.is_valid():
            bug = form.save(commit = False)
            bug.user = request.user
            bug.save()
            return redirect('report_success')
    else:
        form = BugReportForm()
    return render(request, 'app/bug_report.html')


def report_success(request):
    return render(request, 'app/report_success.html')


@login_required(login_url='denied')
def put_comment(request, music_id):
    music = get_object_or_404(UploadedMusic, id=music_id)
    comments = music.comments.all()  # Retrieve all comments for this music

    if request.method == "POST":
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.user = request.user
            comment.music = music
            comment.save()
            return redirect('put_comment', music_id=music.id)  # Redirect to update comments
    else:
        form = CommentForm()

    return render(request, 'app/comment.html', {
        'music': music,
        'comments': comments,
        'form': form
    })


@login_required(login_url='denied')

def share_music(request, music_id):
    music = get_object_or_404(UploadedMusic, id=music_id)

    if request.method == "POST":
        form = ShareMusicForm(request.POST)
        if form.is_valid():
            shared_music = form.save(commit=False)
            shared_music.sender = request.user
            shared_music.music = music
            shared_music.save()
            return redirect("music_list")

    else:
        form = ShareMusicForm()

    return render(request, "app/share_music.html", {"form": form, "music": music})


@login_required(login_url='denied')
def shared_music_list(request):
    shared_music = SharedMusic.objects.filter(receiver=request.user)
    return render(request, "app/shared_music.html", {"shared_music": shared_music})


@login_required(login_url='denied')
def delete_acc(request):
    if request.method == 'POST':
        user = request.user
        logout(request)
        try:
            member = Artist.objects.get(username=user.username)
            member.delete()
        except Artist.DoesNotExist:
            pass

        User.objects.filter(id=user.id).delete()
        return redirect('home')
    else:
        return render(request, 'app/delete_acc.html')


@login_required(login_url='denied')
def create_playlist(request):
    if request.method == "POST":
        form = PlaylistForm(request.POST)
        if form.is_valid():
            playlist = form.save(commit=False)
            playlist.user = request.user
            playlist.save()
            return redirect('playlist_list')
    else:
        form = PlaylistForm()

    return render(request, 'app/create_playlist.html', {'form': form})


@login_required(login_url='denied')
def playlist_list(request):
    playlists = Playlist.objects.filter(user=request.user)
    return render(request, 'app/playlist_list.html', {'playlists': playlists})


@login_required(login_url='denied')
def add_to_playlist(request, music_id):
    music = get_object_or_404(UploadedMusic, id=music_id)

    if request.method == "POST":
        form = AddToPlaylistForm(request.POST, user=request.user)
        if form.is_valid():
            playlist = form.cleaned_data['playlist']
            playlist.songs.add(music)
            return redirect('playlist_list')

    else:
        form = AddToPlaylistForm(user=request.user)

    return render(request, 'app/add_to_playlist.html', {'form': form, 'music': music})


@login_required(login_url='denied')
def remove_from_playlist(request, playlist_id, music_id):
    playlist = get_object_or_404(Playlist, id=playlist_id, user=request.user)
    music = get_object_or_404(UploadedMusic, id=music_id)

    if music in playlist.songs.all():
        playlist.songs.remove(music)
        messages.success(request, f'"{music.title}" has been removed from {playlist.name}.')

    return redirect('playlist_list')


@login_required(login_url='denied')
def delete_playlist(request, playlist_id):
    playlist = get_object_or_404(Playlist, id=playlist_id, user=request.user)

    if request.method == "POST":
        playlist.delete()
        messages.success(request, f'Playlist "{playlist.name}" has been deleted.')
        return redirect('playlist_list')

    return render(request, 'app/delete_playlist.html', {'playlist': playlist})
