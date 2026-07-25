<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ar_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ar_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type')->default('pblr');
            $table->bigInteger('file_size')->default(0);
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('view_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ar_contents');
    }
};
