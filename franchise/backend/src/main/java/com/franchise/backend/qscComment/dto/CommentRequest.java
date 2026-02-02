package com.franchise.backend.qscComment.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class CommentRequest {

    private String storeName;
    private String svComment;

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getSvComment() {
        return svComment;
    }

    public void setSvComment(String svComment) {
        this.svComment = svComment;
    }
}

