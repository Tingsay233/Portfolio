from django.contrib import admin
from app.models import Artist
from app.models import UploadedMusic
from app.models import BugReport
from app.models import Comment

admin.site.register(UploadedMusic)
admin.site.register(Artist)
admin.site.register(BugReport)
admin.site.register(Comment)

