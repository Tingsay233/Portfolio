"""
Definition of models.
"""

from django.db import models

from django.contrib.auth.models import User

#sharing entity

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True, null=True)
    settings = models.JSONField(default=dict)  # Store settings as JSON

    def __str__(self):
        
        return self.user.username

class Artist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    username = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.username


class UploadedMusic(models.Model):
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    description = models.TextField(max_length=600)
    publication_date = models.DateField()
    music_file = models.FileField(upload_to = 'music/', null = True, blank = True)
    class Meta:
        db_table ='UploadedMusic'
    def __str__(self):
        return self.title
        
        
class BugReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User who reported the issue
    title = models.CharField(max_length=255)  # Issue title
    description = models.TextField()  # Detailed issue description
    created_at = models.DateTimeField(auto_now_add=True)  # Auto timestamp
    status = models.CharField(
        max_length=20,
        choices=[('Pending', 'Pending'), ('Resolved', 'Resolved')],
        default='Pending'
    )

    class Meta:
        db_table = 'BugReport'

    def __str__(self):
        return f"{self.title} ({self.status})"


class Comment(models.Model):
    music = models.ForeignKey('UploadedMusic', on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} on {self.music.title}"


class SharedMusic(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_music")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_music")
    music = models.ForeignKey(UploadedMusic, on_delete=models.CASCADE)
    shared_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username} shared {self.music.title} with {self.receiver.username}"


class Playlist(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="playlists")
    songs = models.ManyToManyField(UploadedMusic, related_name="playlists", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.user.username})"
