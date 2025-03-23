"""myproject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path

from app import views, forms
import django.contrib.auth.views
from django.contrib.auth.views import LoginView, LogoutView
from datetime import datetime
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views

admin.autodiscover()    

urlpatterns = [
    path('admin/', admin.site.urls),
    re_path(r'^$', views.home, name='home'),
    re_path(r'^contact$', views.contact, name='contact'),
    re_path(r'^about$', views.about, name='about'),
    re_path(r'^login/$',
        LoginView.as_view(template_name = 'app/login.html'),
        name='login'),
    re_path(r'^logout$',
        LogoutView.as_view(template_name = 'app/index.html'),
        name='logout'),
    re_path(r'^menu$', views.menu, name='menu'),
    re_path(r'^signup/?$', views.signup, name='signup'),
    re_path(r'^registerArtist$', views.registerArtist, name='registerArtist'),
    path('denied/', views.denied, name='denied'),
    path('upload/', views.upload_music, name='upload'),
    path('music/', views.music_list, name='music_list'),
    path('profile/', views.Profile, name='profile'),  # Add profile route
    path('bug_report/', views.bug_report, name='bug_report'),
    path('report_success/', views.report_success, name='report_success'),
    path('comment/<int:music_id>/', views.put_comment, name='put_comment'),
    path('change-username/', views.change_username, name='change_username'),
    path(
        'password_change/',
        auth_views.PasswordChangeView.as_view(template_name='app/change_password.html'),
        name='password_change'
    ),
    path("share_music/<int:music_id>/", views.share_music, name="share_music"),
    path("shared_music/", views.shared_music_list, name="shared_music_list"),
    path('delete_acc/', views.delete_acc, name='delete_acc'),
    path('playlist/create/', views.create_playlist, name='create_playlist'),
    path('playlist/', views.playlist_list, name='playlist_list'),
    path('playlist/add/<int:music_id>/', views.add_to_playlist, name='add_to_playlist'),
    path('playlist/remove/<int:playlist_id>/<int:music_id>/', views.remove_from_playlist, name='remove_from_playlist'),
    path('playlist/delete/<int:playlist_id>/', views.delete_playlist, name='delete_playlist'),
    path('password_change/done/', views.password_changed_done, name='password_change_done'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)    
